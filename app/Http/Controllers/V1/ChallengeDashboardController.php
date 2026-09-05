<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Support\RegionalChallenge;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChallengeDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $countries = RegionalChallenge::countriesWithTotals();

        return Inertia::render('v1/dashboard', [
            'regional' => RegionalChallenge::regionalSummary($countries),
            'countries' => RegionalChallenge::rankedCountries($countries),
            'activity' => RegionalChallenge::activityProps($request),
        ]);
    }
}
