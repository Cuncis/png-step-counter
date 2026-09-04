<?php

namespace Tests\Feature;

use App\Models\FormSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_authenticated_users_are_redirected_from_home_to_steps(): void
    {
        $user = User::factory()->create();
        FormSubmission::factory()->create(['user_id' => $user->id, 'is_complete' => true]);

        $this->actingAs($user)
            ->get('/')
            ->assertRedirect(route('steps.index', absolute: false));
    }
}
