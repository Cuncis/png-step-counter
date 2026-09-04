<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Models\ChallengeCountry;
use App\Models\ChallengeStepEntry;
use App\Support\RegionalChallenge;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChallengeDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $countries = ChallengeCountry::withSum('stepEntries as total_steps', 'steps')->get();

        $regionalTotal = (int) $countries->sum('total_steps');
        $regionalGoal = RegionalChallenge::REGIONAL_GOAL;
        $regionalProgress = $regionalGoal > 0 ? min(100, (int) round(($regionalTotal / $regionalGoal) * 100)) : 0;

        $ranked = $countries
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

        $participants = ChallengeStepEntry::whereNotNull('participant_name')
            ->distinct()
            ->count('participant_name');

        return Inertia::render('v1/dashboard', [
            'regional' => [
                'total_steps' => $regionalTotal,
                'goal_steps' => $regionalGoal,
                'progress_percent' => $regionalProgress,
                'remaining_steps' => max(0, $regionalGoal - $regionalTotal),
                'participants' => $participants,
                'days_remaining' => RegionalChallenge::daysRemaining(),
                'is_complete' => $regionalTotal >= $regionalGoal,
            ],
            'countries' => $ranked,
            'activity' => $this->activityProps($request),
        ]);
    }

    /**
     * @return array{entries: array<int, array<string, mixed>>, sort: string, direction: string, country: string|null, date: string|null}
     */
    private function activityProps(Request $request): array
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

        $entries = $query->limit(100)->get()->map(fn (ChallengeStepEntry $entry) => [
            'id' => $entry->id,
            'date' => $entry->date->toDateString(),
            'participant_name' => $entry->participant_name,
            'steps' => $entry->steps,
            'country' => [
                'name' => $entry->country->name,
                'code' => $entry->country->code,
                'flag_emoji' => $entry->country->flag_emoji,
            ],
        ]);

        return [
            'entries' => $entries->all(),
            'sort' => $sort,
            'direction' => $direction,
            'country' => $countryCode,
            'date' => $date,
        ];
    }
}
