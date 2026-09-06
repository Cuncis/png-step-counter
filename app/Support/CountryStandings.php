<?php

namespace App\Support;

use App\Models\CountryGoal;
use App\Models\StepEntry;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * The homepage's regional total, country leaderboard, and activity feed,
 * built from real step submissions and each user's journey country (rather
 * than the separate, seeded v1 challenge demo data in {@see RegionalChallenge}).
 */
class CountryStandings
{
    /**
     * Every user whose journey country is known, with their lifetime step
     * total. Admins and users still mid-journey have no country yet and are
     * excluded.
     *
     * @return Collection<int, array{country: string, total_steps: int}>
     */
    private static function participants(): Collection
    {
        return User::query()
            ->with('formSubmission')
            ->withSum('stepEntries as steps_total', 'steps')
            ->get()
            ->map(fn (User $user) => [
                'country' => $user->formSubmission?->steps[1]['country'] ?? null,
                'total_steps' => (int) $user->steps_total,
            ])
            ->filter(fn (array $row) => $row['country'] !== null)
            ->values();
    }

    /**
     * @return array{total_steps: int, goal_steps: int, progress_percent: int, remaining_steps: int, participants: int, is_complete: bool}
     */
    public static function regionalSummary(): array
    {
        $participants = self::participants();
        $regionalTotal = (int) $participants->sum('total_steps');
        $regionalGoal = (int) CountryGoal::query()->sum('goal_steps');
        $regionalProgress = $regionalGoal > 0 ? min(100, (int) round(($regionalTotal / $regionalGoal) * 100)) : 0;

        return [
            'total_steps' => $regionalTotal,
            'goal_steps' => $regionalGoal,
            'progress_percent' => $regionalProgress,
            'remaining_steps' => max(0, $regionalGoal - $regionalTotal),
            'participants' => $participants->filter(fn (array $row) => $row['total_steps'] > 0)->count(),
            'is_complete' => $regionalGoal > 0 && $regionalTotal >= $regionalGoal,
        ];
    }

    /**
     * @return list<array{id: int, name: string, code: string, flag_emoji: string, goal_steps: int, total_steps: int, progress_percent: int, rank: int}>
     */
    public static function rankedCountries(): array
    {
        $totalsByCountry = self::participants()
            ->groupBy('country')
            ->map(fn (Collection $rows) => (int) $rows->sum('total_steps'));

        return CountryGoal::query()
            ->orderBy('id')
            ->get()
            ->map(fn (CountryGoal $goal) => [
                'id' => $goal->id,
                'name' => $goal->name,
                'code' => $goal->code,
                'flag_emoji' => CountryFlags::emoji($goal->code),
                'goal_steps' => $goal->goal_steps,
                'total_steps' => (int) ($totalsByCountry[$goal->code] ?? 0),
            ])
            ->sortByDesc('total_steps')
            ->values()
            ->map(fn (array $country, int $index) => [
                ...$country,
                'progress_percent' => $country['goal_steps'] > 0
                    ? min(100, (int) round(($country['total_steps'] / $country['goal_steps']) * 100))
                    : 0,
                'rank' => $index + 1,
            ])
            ->all();
    }

    /**
     * @return array{entries: list<array<string, mixed>>, sort: string, direction: string, country: string|null, date: string|null, current_page: int, last_page: int, total: int}
     */
    public static function paginatedActivity(Request $request, int $perPage = 15): array
    {
        $sort = $request->string('sort', 'date')->value();
        $sort = in_array($sort, ['date', 'country', 'steps'], true) ? $sort : 'date';
        $direction = $request->string('direction', 'desc')->value();
        $direction = in_array($direction, ['asc', 'desc'], true) ? $direction : 'desc';
        $countryCode = $request->string('country')->value() ?: null;
        $date = $request->string('date')->value() ?: null;
        $countryNames = Countries::all();

        $entries = StepEntry::query()
            ->with('user.formSubmission')
            ->when($date, fn ($query) => $query->whereDate('date', $date))
            ->get()
            ->map(fn (StepEntry $entry) => [
                'id' => $entry->id,
                'date' => $entry->date->toDateString(),
                'participant_name' => $entry->user->name,
                'steps' => $entry->steps,
                'country_code' => $entry->user->formSubmission?->steps[1]['country'] ?? null,
            ])
            ->filter(fn (array $row) => $row['country_code'] !== null)
            ->when($countryCode, fn (Collection $rows) => $rows->filter(fn (array $row) => $row['country_code'] === $countryCode));

        $descending = $direction === 'desc';

        $entries = match ($sort) {
            'country' => $entries->sortBy(fn (array $row) => $countryNames[$row['country_code']] ?? $row['country_code'], SORT_STRING, $descending),
            'steps' => $entries->sortBy('steps', SORT_REGULAR, $descending),
            default => $entries->sortBy('date', SORT_REGULAR, $descending),
        };

        $entries = $entries->values();
        $total = $entries->count();
        $lastPage = max(1, (int) ceil($total / $perPage));
        $page = min(max(1, $request->integer('page', 1)), $lastPage);

        $items = $entries->forPage($page, $perPage)
            ->map(fn (array $row) => [
                'id' => $row['id'],
                'date' => $row['date'],
                'participant_name' => $row['participant_name'],
                'steps' => $row['steps'],
                'country' => [
                    'name' => $countryNames[$row['country_code']] ?? $row['country_code'],
                    'code' => $row['country_code'],
                    'flag_emoji' => CountryFlags::emoji($row['country_code']),
                ],
            ])
            ->values()
            ->all();

        return [
            'entries' => $items,
            'sort' => $sort,
            'direction' => $direction,
            'country' => $countryCode,
            'date' => $date,
            'current_page' => $page,
            'last_page' => $lastPage,
            'total' => $total,
        ];
    }
}
