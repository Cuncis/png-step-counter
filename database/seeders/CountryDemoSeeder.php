<?php

namespace Database\Seeders;

use App\Models\FormSubmission;
use App\Models\StepEntry;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Seeds users with a completed health journey and random daily step entries
 * for each of the three challenge countries, so the admin dashboard's
 * per-country totals have realistic demo data to display.
 */
class CountryDemoSeeder extends Seeder
{
    use WithoutModelEvents;

    private const USERS_PER_COUNTRY = 6;

    private const DAYS_OF_HISTORY = 14;

    private const OCCUPATIONS = [
        'student', 'office', 'healthcare', 'education', 'retail_service',
        'trades', 'delivery_logistics', 'homemaker', 'retired', 'unemployed',
    ];

    private const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'very_active'];

    private const GENDERS = ['female', 'male', 'non_binary', 'prefer_not_to_say'];

    public function run(): void
    {
        $placeholder = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
        );

        foreach (['MY', 'PH', 'ID'] as $country) {
            User::factory()
                ->count(self::USERS_PER_COUNTRY)
                ->create()
                ->each(function (User $user) use ($country, $placeholder) {
                    FormSubmission::factory()->create([
                        'user_id' => $user->id,
                        'current_step' => 3,
                        'is_complete' => true,
                        'steps' => [
                            1 => [
                                'date_of_birth' => fake()->dateTimeBetween('-55 years', '-18 years')->format('Y-m-d'),
                                'gender' => fake()->randomElement(self::GENDERS),
                                'country' => $country,
                            ],
                            2 => [
                                'height_cm' => (string) fake()->numberBetween(150, 190),
                                'weight_kg' => (string) fake()->numberBetween(45, 100),
                            ],
                            3 => [
                                'occupation' => fake()->randomElement(self::OCCUPATIONS),
                                'activity_level' => fake()->randomElement(self::ACTIVITY_LEVELS),
                            ],
                        ],
                    ]);

                    collect(range(0, self::DAYS_OF_HISTORY - 1))->each(function (int $offset) use ($user, $placeholder) {
                        $path = "step-evidence/{$user->id}/".Str::random(30).'.png';
                        Storage::disk('public')->put($path, $placeholder);

                        StepEntry::factory()->create([
                            'user_id' => $user->id,
                            'date' => today()->subDays($offset),
                            'steps' => fake()->numberBetween(3000, 16000),
                            'evidence_path' => $path,
                        ]);
                    });
                });
        }
    }
}
