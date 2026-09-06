<?php

namespace Tests\Feature;

use App\Models\CountryGoal;
use App\Models\FormSubmission;
use App\Models\StepEntry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CountryStandingsTest extends TestCase
{
    use RefreshDatabase;

    private function participant(string $country, int $steps): User
    {
        $user = User::factory()->create();
        FormSubmission::factory()->create([
            'user_id' => $user->id,
            'steps' => [1 => ['country' => $country]],
            'is_complete' => true,
        ]);
        StepEntry::factory()->create(['user_id' => $user->id, 'steps' => $steps]);

        return $user;
    }

    public function test_regional_summary_totals_real_step_entries_by_country(): void
    {
        $this->participant('MY', 1000);
        $this->participant('PH', 2000);

        $response = $this->get('/');

        $goalSteps = CountryGoal::query()->sum('goal_steps');

        $response->assertInertia(fn ($page) => $page
            ->where('regional.total_steps', 3000)
            ->where('regional.goal_steps', $goalSteps)
            ->where('regional.participants', 2)
        );
    }

    public function test_users_with_no_completed_journey_are_excluded_from_the_regional_total(): void
    {
        $user = User::factory()->create();
        StepEntry::factory()->create(['user_id' => $user->id, 'steps' => 5000]);

        $response = $this->get('/');

        $response->assertInertia(fn ($page) => $page
            ->where('regional.total_steps', 0)
            ->where('regional.participants', 0)
        );
    }

    public function test_country_leaderboard_ranks_countries_by_real_totals(): void
    {
        $this->participant('MY', 1000);
        $this->participant('PH', 5000);

        $response = $this->get('/');

        $response->assertInertia(function ($page) {
            $page->has('countries', 3);

            $countries = collect($page->toArray()['props']['countries']);

            $this->assertSame('PH', $countries->firstWhere('rank', 1)['code']);
            $this->assertSame(5000, $countries->firstWhere('code', 'PH')['total_steps']);
            $this->assertSame(1000, $countries->firstWhere('code', 'MY')['total_steps']);
            $this->assertSame(0, $countries->firstWhere('code', 'ID')['total_steps']);
        });
    }

    public function test_daily_activity_shows_the_real_participants_name_and_steps(): void
    {
        $user = $this->participant('ID', 4200);

        $response = $this->get('/');

        $response->assertInertia(fn ($page) => $page
            ->where('activity.entries.0.participant_name', $user->name)
            ->where('activity.entries.0.steps', 4200)
            ->where('activity.entries.0.country.code', 'ID')
        );
    }

    public function test_daily_activity_can_be_filtered_by_country(): void
    {
        $this->participant('MY', 1000);
        $this->participant('PH', 2000);

        $response = $this->get('/?country=MY');

        $response->assertInertia(fn ($page) => $page
            ->has('activity.entries', 1)
            ->where('activity.entries.0.country.code', 'MY')
        );
    }
}
