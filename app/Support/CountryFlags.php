<?php

namespace App\Support;

/**
 * Inline SVG flags for the countries eligible in the health journey, used to
 * render a flag image in the admin panel without pulling in flag icon assets.
 */
class CountryFlags
{
    public static function svg(?string $code): ?string
    {
        return match ($code) {
            'ID' => self::indonesia(),
            'MY' => self::malaysia(),
            'PH' => self::philippines(),
            default => null,
        };
    }

    public static function dataUri(?string $code): ?string
    {
        $svg = self::svg($code);

        return $svg ? 'data:image/svg+xml;base64,'.base64_encode($svg) : null;
    }

    /**
     * A flag image followed by a text label, as an HTML string for contexts
     * that render labels unescaped (e.g. Filament stats and infolist entries).
     */
    public static function labelHtml(?string $code, string $label, int $height = 16): string
    {
        $flag = self::dataUri($code);

        if (! $flag) {
            return e($label);
        }

        $width = (int) round($height * 1.5);

        return sprintf(
            '<img src="%s" alt="" style="display:inline-block;vertical-align:middle;width:%dpx;height:%dpx;border-radius:2px;object-fit:cover;margin-right:6px;" /><span style="vertical-align:middle;">%s</span>',
            e($flag),
            $width,
            $height,
            e($label),
        );
    }

    private static function indonesia(): string
    {
        return <<<'SVG'
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
            <rect width="60" height="20" fill="#CE1126"/>
            <rect y="20" width="60" height="20" fill="#FFFFFF"/>
        </svg>
        SVG;
    }

    private static function philippines(): string
    {
        return <<<'SVG'
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
            <rect width="60" height="20" fill="#0038A8"/>
            <rect y="20" width="60" height="20" fill="#CE1126"/>
            <polygon points="0,0 0,40 26,20" fill="#FFFFFF"/>
            <circle cx="12" cy="20" r="4.5" fill="#FCD116"/>
            <circle cx="7" cy="7" r="1.7" fill="#FCD116"/>
            <circle cx="7" cy="33" r="1.7" fill="#FCD116"/>
            <circle cx="22.5" cy="20" r="1.7" fill="#FCD116"/>
        </svg>
        SVG;
    }

    private static function malaysia(): string
    {
        $stripeHeight = 40 / 14;
        $stripes = '';

        for ($i = 0; $i < 14; $i++) {
            $color = $i % 2 === 0 ? '#CC0001' : '#FFFFFF';
            $y = round($i * $stripeHeight, 2);
            $stripes .= sprintf('<rect y="%s" width="60" height="%s" fill="%s"/>', $y, round($stripeHeight, 2) + 0.1, $color);
        }

        return <<<SVG
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40">
            {$stripes}
            <rect width="26" height="20" fill="#010066"/>
            <circle cx="10" cy="10" r="6.5" fill="#FFCC00"/>
            <circle cx="12.5" cy="10" r="5.5" fill="#010066"/>
            <polygon points="19,10 21.8,7.8 20.6,10 21.8,12.2" fill="#FFCC00"/>
        </svg>
        SVG;
    }
}
