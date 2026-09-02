<?php

namespace Tests\Feature;

use App\Models\FormSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FormFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $this->get('/dashboard')->assertRedirect('/login');
        $this->get('/form')->assertRedirect('/login');
        $this->get('/form/1')->assertRedirect('/login');
        $this->get('/review')->assertRedirect('/login');
    }

    public function test_authenticated_users_can_visit_the_dashboard(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get('/dashboard')->assertOk();
    }

    public function test_visiting_the_form_index_redirects_to_the_current_step(): void
    {
        $user = User::factory()->create();
        FormSubmission::factory()->create(['user_id' => $user->id, 'current_step' => 2]);

        $this->actingAs($user)
            ->get('/form')
            ->assertRedirect(route('form.show', ['step' => 2]));
    }

    public function test_saving_a_step_with_invalid_data_does_not_advance(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/form/1', ['date_of_birth' => '', 'country' => ''])
            ->assertSessionHasErrors(['date_of_birth', 'country']);

        $this->assertSame(1, $user->fresh()->formSubmission?->current_step ?? 1);
    }

    public function test_saving_a_step_persists_data_and_advances_to_the_next_step(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/form/1', [
            'date_of_birth' => '1990-01-01',
            'gender' => 'prefer_not_to_say',
            'country' => 'ID',
        ]);

        $response->assertRedirect(route('form.show', ['step' => 2]));

        $submission = $user->fresh()->formSubmission;
        $this->assertSame(2, $submission->current_step);
        $this->assertFalse($submission->is_complete);
        $this->assertSame('ID', $submission->steps[1]['country']);
    }

    public function test_occupation_other_is_required_when_occupation_is_other(): void
    {
        $user = User::factory()->create();
        FormSubmission::factory()->create(['user_id' => $user->id, 'current_step' => 3]);

        $this->actingAs($user)
            ->post('/form/3', ['occupation' => 'other', 'occupation_other' => '', 'activity_level' => 'light'])
            ->assertSessionHasErrors(['occupation_other']);
    }

    public function test_completing_the_final_step_marks_the_submission_complete_and_redirects_to_review(): void
    {
        $user = User::factory()->create();
        FormSubmission::factory()->create(['user_id' => $user->id, 'current_step' => 3]);

        $response = $this->actingAs($user)->post('/form/3', [
            'occupation' => 'office',
            'activity_level' => 'moderate',
        ]);

        $response->assertRedirect(route('form.review'));

        $submission = $user->fresh()->formSubmission;
        $this->assertTrue($submission->is_complete);
    }

    public function test_review_page_shows_saved_answers(): void
    {
        $user = User::factory()->create();
        FormSubmission::factory()->create([
            'user_id' => $user->id,
            'steps' => [1 => ['date_of_birth' => '1990-01-01', 'country' => 'ID']],
            'current_step' => 2,
        ]);

        $this->actingAs($user)->get('/review')->assertOk();
    }

    public function test_users_can_reset_their_submission(): void
    {
        $user = User::factory()->create();
        FormSubmission::factory()->create([
            'user_id' => $user->id,
            'steps' => [1 => ['country' => 'ID']],
            'current_step' => 2,
            'is_complete' => false,
        ]);

        $response = $this->actingAs($user)->post('/form/reset');

        $response->assertRedirect(route('form.show', ['step' => 1]));

        $submission = $user->fresh()->formSubmission;
        $this->assertSame(1, $submission->current_step);
        $this->assertEmpty($submission->steps);
        $this->assertFalse($submission->is_complete);
    }
}
