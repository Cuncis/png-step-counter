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
            ['key' => 'seven-day-streak', 'label' => '7-day streak'],
            ['key' => 'thirty-day-month', 'label' => '30 days in a month'],
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
     * @param  Collection<int, StepEntry>  $entries
     * @return list<string>
     */
    public static function unlockedAchievements(Collection $entries): array
    {
        $unlocked = [];

        if ($entries->contains(fn (StepEntry $entry) => $entry->steps >= 1000)) {
            $unlocked[] = 'first-1000';
        }

        if ($entries->contains(fn (StepEntry $entry) => $entry->steps >= 5000)) {
            $unlocked[] = 'five-thousand-day';
        }

        if ($entries->contains(fn (StepEntry $entry) => $entry->steps >= 10000)) {
            $unlocked[] = 'ten-thousand-day';
        }

        if (self::currentStreak($entries) >= 7) {
            $unlocked[] = 'seven-day-streak';
        }

        $loggedByMonth = $entries->groupBy(fn (StepEntry $entry) => $entry->date->format('Y-m'));
        if ($loggedByMonth->contains(fn (Collection $month) => $month->count() >= 30)) {
            $unlocked[] = 'thirty-day-month';
        }

        return $unlocked;
    }

    /**
     * @param  Collection<int, StepEntry>  $entries
     * @return Collection<string, int> Steps keyed by ISO date, for entries within the range.
     */
    public static function stepsByDate(Collection $entries, Carbon $start, Carbon $end): Collection
    {
        return $entries
            ->filter(fn (StepEntry $entry) => $entry->date->between($start, $end))
            ->mapWithKeys(fn (StepEntry $entry) => [$entry->date->toDateString() => $entry->steps]);
    }
}
