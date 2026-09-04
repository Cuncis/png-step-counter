<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Models\ChallengeCountry;
use App\Models\ChallengeStepEntry;
use App\Support\RegionalChallenge;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response as ResponseFacade;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChallengeAdminController extends Controller
{
    public function index(Request $request): Response
    {
        $countries = ChallengeCountry::withSum('stepEntries as total_steps', 'steps')->get();
        $regionalTotal = (int) $countries->sum('total_steps');
        $regionalGoal = RegionalChallenge::REGIONAL_GOAL;

        $countryCode = $request->string('country')->value() ?: null;
        $dateFrom = $request->string('date_from')->value() ?: null;
        $dateTo = $request->string('date_to')->value() ?: null;

        $query = ChallengeStepEntry::query()->with('country')->latest('date')->latest('id');

        if ($countryCode) {
            $query->whereHas('country', fn ($q) => $q->where('code', $countryCode));
        }
        if ($dateFrom) {
            $query->whereDate('date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('date', '<=', $dateTo);
        }

        $entries = $query->paginate(25)->withQueryString();

        return Inertia::render('v1/admin', [
            'countries' => $countries->map(fn (ChallengeCountry $country) => [
                'id' => $country->id,
                'name' => $country->name,
                'code' => $country->code,
                'flag_emoji' => $country->flag_emoji,
                'goal_steps' => $country->goal_steps,
                'total_steps' => (int) $country->total_steps,
            ]),
            'regional' => [
                'total_steps' => $regionalTotal,
                'goal_steps' => $regionalGoal,
                'progress_percent' => $regionalGoal > 0 ? min(100, (int) round(($regionalTotal / $regionalGoal) * 100)) : 0,
            ],
            'entries' => $entries->through(fn (ChallengeStepEntry $entry) => [
                'id' => $entry->id,
                'date' => $entry->date->toDateString(),
                'participant_name' => $entry->participant_name,
                'steps' => $entry->steps,
                'country' => [
                    'id' => $entry->country->id,
                    'name' => $entry->country->name,
                    'code' => $entry->country->code,
                    'flag_emoji' => $entry->country->flag_emoji,
                ],
            ]),
            'filters' => [
                'country' => $countryCode,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function update(Request $request, ChallengeStepEntry $entry): RedirectResponse
    {
        $data = $request->validate([
            'challenge_country_id' => ['required', 'integer', 'exists:challenge_countries,id'],
            'date' => ['required', 'date', 'before_or_equal:today'],
            'steps' => ['required', 'integer', 'min:1', 'max:100000'],
            'participant_name' => ['nullable', 'string', 'max:100'],
        ]);

        $entry->update($data);

        return back()->with('success', 'Step entry updated.');
    }

    public function destroy(ChallengeStepEntry $entry): RedirectResponse
    {
        $entry->delete();

        return back()->with('success', 'Step entry deleted.');
    }

    public function updateGoals(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'goals' => ['required', 'array'],
            'goals.*.id' => ['required', 'integer', 'exists:challenge_countries,id'],
            'goals.*.goal_steps' => ['required', 'integer', 'min:1'],
        ]);

        foreach ($data['goals'] as $goal) {
            ChallengeCountry::whereKey($goal['id'])->update(['goal_steps' => $goal['goal_steps']]);
        }

        return back()->with('success', 'Country goals updated.');
    }

    public function export(Request $request): StreamedResponse
    {
        $countryCode = $request->string('country')->value() ?: null;
        $dateFrom = $request->string('date_from')->value() ?: null;
        $dateTo = $request->string('date_to')->value() ?: null;

        $query = ChallengeStepEntry::query()->with('country')->orderBy('date');

        if ($countryCode) {
            $query->whereHas('country', fn ($q) => $q->where('code', $countryCode));
        }
        if ($dateFrom) {
            $query->whereDate('date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('date', '<=', $dateTo);
        }

        $filename = 'step-challenge-export-'.now()->format('Y-m-d').'.csv';

        return ResponseFacade::streamDownload(function () use ($query) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Date', 'Country', 'Participant', 'Steps']);

            $query->chunk(500, function ($chunk) use ($handle) {
                foreach ($chunk as $entry) {
                    fputcsv($handle, [
                        $entry->date->toDateString(),
                        $entry->country->name,
                        $entry->participant_name ?? '',
                        $entry->steps,
                    ]);
                }
            });

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }
}
