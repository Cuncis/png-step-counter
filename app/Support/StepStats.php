<?php

namespace App\Support;

use App\Models\StepEntry;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Derives streaks and achievement unlocks from a user's step entries.
 */
class StepStats
{
    /**
     * @return array{key: string, label: string}[]
     */
    public static function achievementDefinitions(): array
    {
        return [
            ['key' => 'first-1000', 'label' => 'First 1,000'],
            ['key' => 'five-thousand-day', 'label' => '5,000 in a day'],
            ['key' => 'ten-thousand-day', 'label' => '10,000 in a day'],
            ['key' => 'fifteen-thousand-day', 'label' => '15,000 in a day'],
            ['key' => 'twenty-thousand-day', 'label' => '20,000 in a day'],
            ['key' => 'three-day-streak', 'label' => '3-day streak'],
            ['key' => 'seven-day-streak', 'label' => '7-day streak'],
            ['key' => 'fourteen-day-streak', 'label' => '14-day streak'],
            ['key' => 'thirty-day-streak', 'label' => '30-day streak'],
            ['key' => 'hundred-day-streak', 'label' => '100-day streak'],
            ['key' => 'total-50k', 'label' => '50,000 lifetime steps'],
            ['key' => 'total-100k', 'label' => '100,000 lifetime steps'],
            ['key' => 'total-500k', 'label' => '500,000 lifetime steps'],
            ['key' => 'total-1m', 'label' => '1,000,000 lifetime steps'],
            ['key' => 'total-5m', 'label' => '5,000,000 lifetime steps'],
            ['key' => 'thirty-day-month', 'label' => '30 days in a month'],
            ['key' => 'first-week-logged', 'label' => '7 days logged'],
            ['key' => 'hundred-days-logged', 'label' => '100 days logged'],
            ['key' => 'weekend-warrior', 'label' => 'Weekend warrior'],
            ['key' => 'early-bird', 'label' => 'Early bird'],
        ];
    }

    /**
     * Consecutive days, ending today, with a logged entry of at least one step.
     *
     * @param  Collection<int, StepEntry>  $entries
     */
    public static function currentStreak(Collection $entries): int
    {
        $byDate = $entries->keyBy(fn (StepEntry $entry) => $entry->date->toDateString());

        $streak = 0;
        $cursor = today();

        while (($entry = $byDate->get($cursor->toDateString())) && $entry->steps > 0) {
            $streak++;
            $cursor = $cursor->copy()->subDay();
        }

        return $streak;
    }

    /**
     * The longest run of consecutive days (anywhere in history) with a
     * logged entry of at least one step. Unlike currentStreak(), this
     * doesn't reset just because the streak isn't active today, so
     * streak-based achievements stay unlocked once earned.
     *
     * @param  Collection<int, StepEntry>  $entries
     */
    public static function longestStreak(Collection $entries): int
    {
        $dates = $entries
            ->filter(fn (StepEntry $entry) => $entry->steps > 0)
            ->map(fn (StepEntry $entry) => $entry->date->toDateString())
            ->unique()
            ->sort()
            ->values();

        if ($dates->isEmpty()) {
            return 0;
        }

        $longest = 1;
        $current = 1;

        for ($i = 1; $i < $dates->count(); $i++) {
            $previous = Carbon::parse($dates[$i - 1]);
            $day = Carbon::parse($dates[$i]);

            $current = $previous->diffInDays($day) === 1 ? $current + 1 : 1;
            $longest = max($longest, $current);
        }

        return $longest;
    }

    /**
     * @param  Collection<int, StepEntry>  $entries
     * @return list<string>
     */
    public static function unlockedAchievements(Collection $entries): array
    {
        $unlocked = [];

        $totalSteps = (int) $entries->sum('steps');
        $daysLogged = $entries->count();
        $longestStreak = self::longestStreak($entries);
        $maxDailySteps = (int) ($entries->max('steps') ?? 0);

        if ($maxDailySteps >= 1000) {
            $unlocked[] = 'first-1000';
        }
        if ($maxDailySteps >= 5000) {
            $unlocked[] = 'five-thousand-day';
        }
        if ($maxDailySteps >= 10000) {
            $unlocked[] = 'ten-thousand-day';
        }
        if ($maxDailySteps >= 15000) {
            $unlocked[] = 'fifteen-thousand-day';
        }
        if ($maxDailySteps >= 20000) {
            $unlocked[] = 'twenty-thousand-day';
        }

        if ($longestStreak >= 3) {
            $unlocked[] = 'three-day-streak';
        }
        if ($longestStreak >= 7) {
            $unlocked[] = 'seven-day-streak';
        }
        if ($longestStreak >= 14) {
            $unlocked[] = 'fourteen-day-streak';
        }
        if ($longestStreak >= 30) {
            $unlocked[] = 'thirty-day-streak';
        }
        if ($longestStreak >= 100) {
            $unlocked[] = 'hundred-day-streak';
        }

        if ($totalSteps >= 50_000) {
            $unlocked[] = 'total-50k';
        }
        if ($totalSteps >= 100_000) {
            $unlocked[] = 'total-100k';
        }
        if ($totalSteps >= 500_000) {
            $unlocked[] = 'total-500k';
        }
        if ($totalSteps >= 1_000_000) {
            $unlocked[] = 'total-1m';
        }
        if ($totalSteps >= 5_000_000) {
            $unlocked[] = 'total-5m';
        }

        $loggedByMonth = $entries->groupBy(fn (StepEntry $entry) => $entry->date->format('Y-m'));
        if ($loggedByMonth->contains(fn (Collection $month) => $month->count() >= 30)) {
            $unlocked[] = 'thirty-day-month';
        }

        if ($daysLogged >= 7) {
            $unlocked[] = 'first-week-logged';
        }
        if ($daysLogged >= 100) {
            $unlocked[] = 'hundred-days-logged';
        }

        $loggedByWeek = $entries->groupBy(fn (StepEntry $entry) => $entry->date->format('o-W'));
        if ($loggedByWeek->contains(function (Collection $week) {
            $daysOfWeek = $week->map(fn (StepEntry $entry) => $entry->date->dayOfWeekIso);

            return $daysOfWeek->contains(6) && $daysOfWeek->contains(7);
        })) {
            $unlocked[] = 'weekend-warrior';
        }

        if ($entries->contains(fn (StepEntry $entry) => (int) $entry->created_at->format('G') < 7)) {
            $unlocked[] = 'early-bird';
        }

        return $unlocked;
    }
}
