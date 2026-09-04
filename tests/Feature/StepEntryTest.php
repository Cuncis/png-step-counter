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
        $this->get('/steps')->assertRedirect('/login');
        $this->post('/steps', ['steps' => 1000])->assertRedirect('/login');
    }

    public function test_authenticated_users_can_visit_the_steps_page(): void
    {
        $this->actingAs($this->userWithCompletedJourney());

        $this->get('/steps')->assertOk();
    }

    public function test_users_with_no_journey_progress_are_redirected_from_steps_to_the_journey(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get('/steps')->assertRedirect(route('form.index'));
        $this->post('/steps', ['steps' => 1000])->assertRedirect(route('form.index'));
    }

    public function test_users_with_an_incomplete_journey_are_redirected_from_steps_to_the_journey(): void
    {
        $user = User::factory()->create();
        FormSubmission::factory()->create(['user_id' => $user->id, 'is_complete' => false]);

        $this->actingAs($user);

        $this->get('/steps')->assertRedirect(route('form.index'));
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

        $response->assertRedirect(route('steps.index'));

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

    public function test_steps_page_reflects_todays_entry_and_week_total(): void
    {
        Storage::fake('public');
        $user = $this->userWithCompletedJourney();

        StepEntry::factory()->for($user)->create(['date' => today(), 'steps' => 4200]);
        StepEntry::factory()->for($user)->create(['date' => today()->subDay(), 'steps' => 3000]);

        $response = $this->actingAs($user)->get('/steps');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('today.steps', 4200)
            ->where('week.total', 7200)
            ->where('week.offset', 0)
            ->where('month.total', 7200)
            ->where('year.total', 7200)
        );
    }

    public function test_week_param_browses_a_previous_week(): void
    {
        $user = $this->userWithCompletedJourney();

        StepEntry::factory()->for($user)->create(['date' => today(), 'steps' => 4200]);
        StepEntry::factory()->for($user)->create(['date' => today()->subWeek(), 'steps' => 5000]);

        $thisWeek = $this->actingAs($user)->get('/steps');
        $thisWeek->assertInertia(fn ($page) => $page->where('week.total', 4200));

        $lastWeek = $this->actingAs($user)->get('/steps?week=-1');
        $lastWeek->assertInertia(fn ($page) => $page
            ->where('week.total', 5000)
            ->where('week.offset', -1)
        );

        // Future weeks are clamped back to the current week.
        $futureWeek = $this->actingAs($user)->get('/steps?week=1');
        $futureWeek->assertInertia(fn ($page) => $page->where('week.offset', 0));
    }
}
