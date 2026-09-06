<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Inertia\Middleware;
use Tests\TestCase;

class RedirectAdminsFromAppTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_and_regular_users_can_view_the_homepage(): void
    {
        $this->get('/')->assertOk();

        $user = User::factory()->create();
        $this->actingAs($user)->get('/')->assertOk();
    }

    public function test_admins_are_redirected_away_from_the_homepage(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->get('/');

        $response->assertStatus(302);
        $response->assertRedirect('/admin');
    }

    public function test_admins_get_a_hard_redirect_from_the_homepage_on_inertia_requests(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $version = app(Middleware::class)->version(Request::create('/'));

        $response = $this->actingAs($admin)
            ->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => $version])
            ->get('/');

        $response->assertStatus(409);
        $response->assertHeader('X-Inertia-Location', url('/admin'));
    }

    public function test_admins_are_redirected_away_from_the_journey(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)->get('/form')->assertRedirect('/admin');
        $this->actingAs($admin)->get('/review')->assertRedirect('/admin');
    }
}
