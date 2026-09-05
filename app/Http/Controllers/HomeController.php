<?php

namespace App\Http\Controllers;

use App\Models\StepEntry;
use App\Support\Countries;
use App\Support\RegionalChallenge;
use App\Support\StepStats;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    private const DAILY_GOAL = 10_000;

    public function index(Request $request): Response
    {
        $countries = RegionalChallenge::countriesWithTotals();

        return Inertia::render('home', [
            'regional' => RegionalChallenge::regionalSummary($countries),
            'countries' => RegionalChallenge::rankedCountries($countries),
            'activity' => RegionalChallenge::paginatedActivity($request),
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
     * @return array{periods: array<string, array{value: int, goal: int}>, streakDays: int, lifetimeSteps: int, unlockedAchievements: list<string>}
     */
    private function personalStats(Request $request): array
    {
        $entries = $request->user()->stepEntries()->orderBy('date')->get();
        $today = today();
        $todayEntry = $entries->first(fn (StepEntry $entry) => $entry->date->isSameDay($today));

        return [
            'periods' => [
                'day' => ['value' => $todayEntry->steps ?? 0, 'goal' => self::DAILY_GOAL],
                'week' => [
                    'value' => (int) $entries->filter(fn (StepEntry $entry) => $entry->date->isSameWeek($today))->sum('steps'),
                    'goal' => self::DAILY_GOAL * 7,
                ],
                'month' => [
                    'value' => (int) $entries->filter(fn (StepEntry $entry) => $entry->date->isSameMonth($today))->sum('steps'),
                    'goal' => self::DAILY_GOAL * $today->daysInMonth,
                ],
                'year' => [
                    'value' => (int) $entries->filter(fn (StepEntry $entry) => $entry->date->isSameYear($today))->sum('steps'),
                    'goal' => self::DAILY_GOAL * ($today->isLeapYear() ? 366 : 365),
                ],
            ],
            'streakDays' => StepStats::currentStreak($entries),
            'lifetimeSteps' => (int) $entries->sum('steps'),
            'unlockedAchievements' => StepStats::unlockedAchievements($entries),
        ];
    }
}
