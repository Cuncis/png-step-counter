<?php

namespace App\Http\Controllers;

use App\Models\StepEntry;
use App\Support\Countries;
use App\Support\CountryStandings;
use App\Support\StepConversions;
use App\Support\StepStats;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    private const DAILY_GOAL = 10_000;

    public function index(Request $request): Response
    {
        return Inertia::render('home', [
            'regional' => CountryStandings::regionalSummary(),
            'countries' => CountryStandings::rankedCountries(),
            'activity' => CountryStandings::paginatedActivity($request),
            'authCountry' => $this->authCountry($request),
            'authGender' => $request->user()?->formSubmission?->steps[1]['gender'] ?? null,
            'personal' => $request->user() ? $this->personalStats($request) : null,
        ]);
    }

    /**
     * @return array{code: string, name: string}|null
     */
    private function authCountry(Request $request): ?array
    {
        $code = $request->user()?->formSubmission?->steps[1]['country'] ?? null;

        if (! $code) {
            return null;
        }

        return ['code' => $code, 'name' => Countries::all()[$code] ?? $code];
    }

    /**
     * @return array{periods: array<string, array{value: int, goal: int, distance_km: float, calories: int}>, streakDays: int, lifetimeSteps: int, unlockedAchievements: list<string>}
     */
    private function personalStats(Request $request): array
    {
        $entries = $request->user()->stepEntries()->orderBy('date')->get();
        $today = today();
        $todayEntry = $entries->first(fn (StepEntry $entry) => $entry->date->isSameDay($today));

        $bodyBasics = $request->user()->formSubmission?->steps[2] ?? [];
        $heightCm = isset($bodyBasics['height_cm']) ? (float) $bodyBasics['height_cm'] : null;
        $weightKg = isset($bodyBasics['weight_kg']) ? (float) $bodyBasics['weight_kg'] : null;

        $period = fn (int $value, int $goal) => [
            'value' => $value,
            'goal' => $goal,
            ...StepConversions::estimate($value, $heightCm, $weightKg),
        ];

        return [
            'periods' => [
                'day' => $period($todayEntry->steps ?? 0, self::DAILY_GOAL),
                'week' => $period(
                    (int) $entries->filter(fn (StepEntry $entry) => $entry->date->isSameWeek($today))->sum('steps'),
                    self::DAILY_GOAL * 7,
                ),
                'month' => $period(
                    (int) $entries->filter(fn (StepEntry $entry) => $entry->date->isSameMonth($today))->sum('steps'),
                    self::DAILY_GOAL * $today->daysInMonth,
                ),
                'year' => $period(
                    (int) $entries->filter(fn (StepEntry $entry) => $entry->date->isSameYear($today))->sum('steps'),
                    self::DAILY_GOAL * ($today->isLeapYear() ? 366 : 365),
                ),
            ],
            'streakDays' => StepStats::currentStreak($entries),
            'lifetimeSteps' => (int) $entries->sum('steps'),
            'unlockedAchievements' => StepStats::unlockedAchievements($entries),
        ];
    }
}
