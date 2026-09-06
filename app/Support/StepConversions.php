<?php

namespace App\Support;

/**
 * Rough distance/calorie estimates from a step count, personalized by the
 * walker's height (stride length) and weight (calorie burn) when known.
 */
class StepConversions
{
    /** Typical adult values, used until the walker answers the journey's body-basics step. */
    private const DEFAULT_HEIGHT_CM = 170.0;

    private const DEFAULT_WEIGHT_KG = 65.0;

    /** Stride length as a fraction of height; a common walking-pace approximation. */
    private const STRIDE_LENGTH_FACTOR = 0.415;

    /** Calories burned per step, per kilogram of body weight (~0.04 kcal/step at 70kg). */
    private const CALORIES_PER_STEP_PER_KG = 0.0005;

    /**
     * @return array{distance_km: float, calories: int}
     */
    public static function estimate(int $steps, ?float $heightCm, ?float $weightKg): array
    {
        $strideMeters = ($heightCm ?: self::DEFAULT_HEIGHT_CM) / 100 * self::STRIDE_LENGTH_FACTOR;

        return [
            'distance_km' => round($steps * $strideMeters / 1000, 1),
            'calories' => (int) round($steps * ($weightKg ?: self::DEFAULT_WEIGHT_KG) * self::CALORIES_PER_STEP_PER_KG),
        ];
    }
}
