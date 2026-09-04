<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\StoreChallengeStepEntryRequest;
use App\Models\ChallengeCountry;
use App\Models\ChallengeStepEntry;
use Illuminate\Http\RedirectResponse;

class ChallengeStepEntryController extends Controller
{
    public function store(StoreChallengeStepEntryRequest $request): RedirectResponse
    {
        $data = $request->validated();

        ChallengeStepEntry::create($data);

        $country = ChallengeCountry::findOrFail($data['challenge_country_id']);
        $steps = number_format($data['steps']);

        return redirect()
            ->route('v1.dashboard')
            ->with('success', "Great job! Your {$steps} steps have been added for {$country->flag_emoji} {$country->name}.");
    }
}
