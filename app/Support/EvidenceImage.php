<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Compresses uploaded evidence photos before storing them, to keep disk
 * usage down. Formats GD can't decode (PDFs, HEIC) are stored unmodified.
 */
class EvidenceImage
{
    private const MAX_DIMENSION = 1600;

    private const JPEG_QUALITY = 75;

    /** @var list<string> */
    private const COMPRESSIBLE_MIMES = ['image/jpeg', 'image/png'];

    public static function store(UploadedFile $file, string $directory): string
    {
        if (! in_array($file->getMimeType(), self::COMPRESSIBLE_MIMES, true)) {
            return $file->store($directory, 'public');
        }

        $source = @imagecreatefromstring(file_get_contents($file->getRealPath()));

        if ($source === false) {
            return $file->store($directory, 'public');
        }

        if ($file->getMimeType() === 'image/jpeg') {
            $source = self::applyExifOrientation($source, $file->getRealPath());
        }

        $width = imagesx($source);
        $height = imagesy($source);
        $scale = min(1, self::MAX_DIMENSION / max($width, $height));
        $targetWidth = (int) round($width * $scale);
        $targetHeight = (int) round($height * $scale);

        $canvas = imagecreatetruecolor($targetWidth, $targetHeight);
        $white = imagecolorallocate($canvas, 255, 255, 255);
        imagefill($canvas, 0, 0, $white);
        imagecopyresampled($canvas, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
        imagedestroy($source);

        ob_start();
        imagejpeg($canvas, null, self::JPEG_QUALITY);
        $encoded = ob_get_clean();
        imagedestroy($canvas);

        $path = "{$directory}/".Str::uuid().'.jpg';
        Storage::disk('public')->put($path, $encoded);

        return $path;
    }

    /**
     * Rotates the decoded image so it displays upright, undoing the
     * rotation flag phone cameras store in EXIF instead of the pixels
     * themselves. Re-encoding with imagejpeg() drops EXIF entirely, so
     * without this the photo would come out sideways.
     *
     * @param  \GdImage  $source
     * @return \GdImage
     */
    private static function applyExifOrientation($source, string $path)
    {
        if (! function_exists('exif_read_data')) {
            return $source;
        }

        $exif = @exif_read_data($path);
        $orientation = $exif['Orientation'] ?? 1;

        $rotated = match ($orientation) {
            3 => imagerotate($source, 180, 0),
            6 => imagerotate($source, -90, 0),
            8 => imagerotate($source, 90, 0),
            default => $source,
        };

        if ($rotated === false) {
            return $source;
        }

        if ($rotated !== $source) {
            imagedestroy($source);
        }

        return $rotated;
    }
}
