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

    public function test_homepage_reflects_the_users_unlocked_achievements(): void
    {
        Storage::fake('public');
        $user = $this->userWithCompletedJourney();

        StepEntry::factory()->for($user)->create(['date' => today(), 'steps' => 4200]);

        $response = $this->actingAs($user)->get('/');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
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
