<?php

namespace App\Support;

use Illuminate\Support\Carbon;

/**
 * Constants for the regional step challenge (v1 preview feature).
 */
class RegionalChallenge
{
    public const REGIONAL_GOAL = 10_000_000;

    public const CHALLENGE_LENGTH_DAYS = 21;

    public static function endDate(): Carbon
    {
        return Carbon::parse('2026-09-25')->endOfDay();
    }

    public static function daysRemaining(): int
    {
        return max(0, (int) now()->startOfDay()->diffInDays(self::endDate(), false));
    }
}
