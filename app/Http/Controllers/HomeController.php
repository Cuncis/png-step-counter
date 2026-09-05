<?php

namespace App\Http\Controllers;

use App\Support\Countries;
use App\Support\RegionalChallenge;
use App\Support\StepStats;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        $countries = RegionalChallenge::countriesWithTotals();

        return Inertia::render('home', [
            'regional' => RegionalChallenge::regionalSummary($countries),
            'countries' => RegionalChallenge::rankedCountries($countries),
            'activity' => RegionalChallenge::paginatedActivity($request),
            'authCountry' => $this->authCountry($request),
            'personal' => $request->user() ? [
                'unlockedAchievements' => StepStats::unlockedAchievements($request->user()->stepEntries()->orderBy('date')->get()),
            ] : null,
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
}
