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

    public function test_authenticated_users_can_view_the_homepage(): void
    {
        $user = User::factory()->create();
        FormSubmission::factory()->create(['user_id' => $user->id, 'is_complete' => true]);

        $this->actingAs($user)
            ->get('/')
            ->assertStatus(200);
    }
}
