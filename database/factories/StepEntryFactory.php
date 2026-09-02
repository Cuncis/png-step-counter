<?php

namespace Database\Factories;

use App\Models\StepEntry;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StepEntry>
 */
class StepEntryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'date' => fake()->date(),
            'steps' => fake()->numberBetween(0, 15000),
            'evidence_path' => 'step-evidence/example.jpg',
        ];
    }
}
