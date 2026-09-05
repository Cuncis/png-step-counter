<?php

namespace Tests\Feature;

use App\Models\FormSubmission;
use App\Models\StepEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StepEntryTest extends TestCase
{
    use RefreshDatabase;

    private function userWithCompletedJourney(): User
    {
        $user = User::factory()->create();
        FormSubmission::factory()->create(['user_id' => $user->id, 'is_complete' => true]);

        return $user;
    }

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $this->post('/steps', ['steps' => 1000])->assertRedirect('/login');
    }

    public function test_users_with_no_journey_progress_are_redirected_to_the_journey(): void
    {
        $this->actingAs(User::factory()->create());

        $this->post('/steps', ['steps' => 1000])->assertRedirect(route('form.index'));
    }

    public function test_users_with_an_incomplete_journey_are_redirected_to_the_journey(): void
    {
        $user = User::factory()->create();
        FormSubmission::factory()->create(['user_id' => $user->id, 'is_complete' => false]);

        $this->actingAs($user);

        $this->post('/steps', ['steps' => 1000])->assertRedirect(route('form.index'));
    }

    public function test_logging_steps_requires_steps_and_evidence(): void
    {
        $this->actingAs($this->userWithCompletedJourney());

        $this->post('/steps', [])->assertSessionHasErrors(['steps', 'evidence']);
    }

    public function test_users_can_log_todays_steps_with_evidence(): void
    {
        Storage::fake('public');
        $user = $this->userWithCompletedJourney();

        $response = $this->actingAs($user)->post('/steps', [
            'steps' => 6500,
            'evidence' => UploadedFile::fake()->image('evidence.jpg'),
        ]);

        $response->assertRedirect(route('home'));

        $entry = StepEntry::where('user_id', $user->id)->where('date', today())->first();
        $this->assertNotNull($entry);
        $this->assertSame(6500, $entry->steps);
        Storage::disk('public')->assertExists($entry->evidence_path);
    }

    public function test_logging_steps_again_the_same_day_replaces_the_entry_and_evidence(): void
    {
        Storage::fake('public');
        $user = $this->userWithCompletedJourney();

        $this->actingAs($user)->post('/steps', [
            'steps' => 3000,
            'evidence' => UploadedFile::fake()->image('first.jpg'),
        ]);
        $firstPath = StepEntry::where('user_id', $user->id)->first()->evidence_path;

        $this->actingAs($user)->post('/steps', [
            'steps' => 8000,
            'evidence' => UploadedFile::fake()->image('second.jpg'),
        ]);

        $entries = StepEntry::where('user_id', $user->id)->get();
        $this->assertCount(1, $entries);
        $this->assertSame(8000, $entries->first()->steps);
        Storage::disk('public')->assertMissing($firstPath);
        Storage::disk('public')->assertExists($entries->first()->evidence_path);
    }

    public function test_uploaded_evidence_images_are_compressed_and_resized(): void
    {
        Storage::fake('public');
        $user = $this->userWithCompletedJourney();

        $this->actingAs($user)->post('/steps', [
            'steps' => 5000,
            'evidence' => UploadedFile::fake()->image('evidence.png', 3000, 2000),
        ]);

        $entry = StepEntry::where('user_id', $user->id)->first();
        $this->assertStringEndsWith('.jpg', $entry->evidence_path);

        [$width, $height, $type] = getimagesize(Storage::disk('public')->path($entry->evidence_path));
        $this->assertSame(IMAGETYPE_JPEG, $type);
        $this->assertLessThanOrEqual(1600, max($width, $height));
    }

    public function test_uploaded_evidence_images_are_rotated_upright_using_exif_orientation(): void
    {
        Storage::fake('public');
        $user = $this->userWithCompletedJourney();

        // A 100x50 (wide) JPEG tagged with EXIF orientation 6 needs a 90deg
        // rotation to display upright, so the output should come out 50x100.
        $canvas = imagecreatetruecolor(100, 50);
        ob_start();
        imagejpeg($canvas);
        $baseJpeg = ob_get_clean();
        imagedestroy($canvas);

        $tiff = 'II'.pack('v', 42).pack('V', 8)
            .pack('v', 1)
            .pack('v', 0x0112).pack('v', 3).pack('V', 1).pack('v', 6).pack('v', 0)
            .pack('V', 0);
        $exifHeader = "Exif\x00\x00".$tiff;
        $app1 = "\xFF\xE1".pack('n', strlen($exifHeader) + 2).$exifHeader;
        $withExif = substr($baseJpeg, 0, 2).$app1.substr($baseJpeg, 2);

        $tmpPath = tempnam(sys_get_temp_dir(), 'exif').'.jpg';
        file_put_contents($tmpPath, $withExif);

        $this->actingAs($user)->post('/steps', [
            'steps' => 5000,
            'evidence' => new UploadedFile($tmpPath, 'evidence.jpg', 'image/jpeg', null, true),
        ]);

        $entry = StepEntry::where('user_id', $user->id)->first();
        [$width, $height] = getimagesize(Storage::disk('public')->path($entry->evidence_path));

        $this->assertSame(50, $width);
        $this->assertSame(100, $height);

        @unlink($tmpPath);
    }

    public function test_pdf_evidence_is_stored_without_compression(): void
    {
        Storage::fake('public');
        $user = $this->userWithCompletedJourney();

        $this->actingAs($user)->post('/steps', [
            'steps' => 5000,
            'evidence' => UploadedFile::fake()->create('evidence.pdf', 100, 'application/pdf'),
        ]);

        $entry = StepEntry::where('user_id', $user->id)->first();
        $this->assertStringEndsWith('.pdf', $entry->evidence_path);
        Storage::disk('public')->assertExists($entry->evidence_path);
    }

    public function test_homepage_reflects_the_users_unlocked_achievements(): void
    {
        Storage::fake('public');
        $user = $this->userWithCompletedJourney();

        StepEntry::factory()->for($user)->create(['date' => today(), 'steps' => 4200]);

        $response = $this->actingAs($user)->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('personal.periods.day.value', 4200)
            ->where('personal.streakDays', 1)
            ->where('personal.lifetimeSteps', 4200)
            ->where('personal.unlockedAchievements', ['first-1000'])
        );
    }

    public function test_guests_see_no_personal_stats_on_the_homepage(): void
    {
        $response = $this->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page->where('personal', null));
    }
}
