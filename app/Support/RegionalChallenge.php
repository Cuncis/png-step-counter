<?php

namespace App\Support;

use App\Models\ChallengeCountry;
use App\Models\ChallengeStepEntry;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Data and constants for the regional step challenge (v1 preview feature),
 * shared by the v1 dashboard and the homepage's copy of it.
 */
class RegionalChallenge
{
    public const REGIONAL_GOAL = 10_000_000;

    public const CHALLENGE_LENGTH_DAYS = 21;

    public static function endDate(): Carbon
    {
        return Carbon::parse('2026-09-30')->endOfDay();
    }

    public static function daysRemaining(): int
    {
        return max(0, (int) now()->startOfDay()->diffInDays(self::endDate(), false));
    }

    /**
     * @return array{total_steps: int, goal_steps: int, progress_percent: int, remaining_steps: int, participants: int, days_remaining: int, is_complete: bool}
     */
    public static function regionalSummary(Collection $countries): array
    {
        $regionalTotal = (int) $countries->sum('total_steps');
        $regionalGoal = self::REGIONAL_GOAL;
        $regionalProgress = $regionalGoal > 0 ? min(100, (int) round(($regionalTotal / $regionalGoal) * 100)) : 0;

        $participants = ChallengeStepEntry::whereNotNull('participant_name')
            ->distinct()
            ->count('participant_name');

        return [
            'total_steps' => $regionalTotal,
            'goal_steps' => $regionalGoal,
            'progress_percent' => $regionalProgress,
            'remaining_steps' => max(0, $regionalGoal - $regionalTotal),
            'participants' => $participants,
            'days_remaining' => self::daysRemaining(),
            'is_complete' => $regionalTotal >= $regionalGoal,
        ];
    }

    /**
     * @return Collection<int, ChallengeCountry>
     */
    public static function countriesWithTotals(): Collection
    {
        return ChallengeCountry::withSum('stepEntries as total_steps', 'steps')->get();
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public static function rankedCountries(Collection $countries): Collection
    {
        return $countries
            ->sortByDesc('total_steps')
            ->values()
            ->map(fn (ChallengeCountry $country, int $index) => [
                'id' => $country->id,
                'name' => $country->name,
                'code' => $country->code,
                'flag_emoji' => $country->flag_emoji,
                'goal_steps' => $country->goal_steps,
                'total_steps' => (int) $country->total_steps,
                'progress_percent' => $country->goal_steps > 0
                    ? min(100, (int) round(($country->total_steps / $country->goal_steps) * 100))
                    : 0,
                'rank' => $index + 1,
            ]);
    }

    /**
     * @return array{query: Builder, sort: string, direction: string, country: string|null, date: string|null}
     */
    private static function filteredActivityQuery(Request $request): array
    {
        $sort = $request->string('sort', 'date')->value();
        $sort = in_array($sort, ['date', 'country', 'steps'], true) ? $sort : 'date';
        $direction = $request->string('direction', 'desc')->value();
        $direction = in_array($direction, ['asc', 'desc'], true) ? $direction : 'desc';
        $countryCode = $request->string('country')->value() ?: null;
        $date = $request->string('date')->value() ?: null;

        $query = ChallengeStepEntry::query()->with('country');

        if ($countryCode) {
            $query->whereHas('country', fn ($q) => $q->where('code', $countryCode));
        }

        if ($date) {
            $query->whereDate('date', $date);
        }

        match ($sort) {
            'country' => $query->join('challenge_countries', 'challenge_countries.id', '=', 'challenge_step_entries.challenge_country_id')
                ->orderBy('challenge_countries.name', $direction)
                ->select('challenge_step_entries.*'),
            'steps' => $query->orderBy('steps', $direction),
            default => $query->orderBy('date', $direction),
        };

        return ['query' => $query, 'sort' => $sort, 'direction' => $direction, 'country' => $countryCode, 'date' => $date];
    }

    /**
     * @param  Collection<int, ChallengeStepEntry>  $entries
     * @return array<int, array<string, mixed>>
     */
    private static function mapActivityEntries(Collection $entries): array
    {
        return $entries->map(fn (ChallengeStepEntry $entry) => [
            'id' => $entry->id,
            'date' => $entry->date->toDateString(),
            'participant_name' => $entry->participant_name,
            'steps' => $entry->steps,
            'country' => [
                'name' => $entry->country->name,
                'code' => $entry->country->code,
                'flag_emoji' => $entry->country->flag_emoji,
            ],
        ])->all();
    }

    /**
     * @return array{entries: array<int, array<string, mixed>>, sort: string, direction: string, country: string|null, date: string|null}
     */
    public static function activityProps(Request $request): array
    {
        $filtered = self::filteredActivityQuery($request);

        $entries = $filtered['query']->limit(100)->get();

        return [
            'entries' => self::mapActivityEntries($entries),
            'sort' => $filtered['sort'],
            'direction' => $filtered['direction'],
            'country' => $filtered['country'],
            'date' => $filtered['date'],
        ];
    }

    /**
     * @return array{entries: array<int, array<string, mixed>>, sort: string, direction: string, country: string|null, date: string|null, current_page: int, last_page: int, total: int}
     */
    public static function paginatedActivity(Request $request, int $perPage = 15): array
    {
        $filtered = self::filteredActivityQuery($request);

        $paginator = $filtered['query']->paginate($perPage, ['*'], 'page')->withQueryString();

        return [
            'entries' => self::mapActivityEntries(collect($paginator->items())),
            'sort' => $filtered['sort'],
            'direction' => $filtered['direction'],
            'country' => $filtered['country'],
            'date' => $filtered['date'],
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'total' => $paginator->total(),
        ];
    }
}
