<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStepEntryRequest;
use App\Models\StepEntry;
use App\Support\EvidenceImage;
use App\Support\StepStats;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class StepEntryController extends Controller
{
    public function store(StoreStepEntryRequest $request): RedirectResponse
    {
        $user = $request->user();
        $date = today();

        $previouslyUnlocked = StepStats::unlockedAchievements($user->stepEntries()->orderBy('date')->get());

        $path = EvidenceImage::store($request->file('evidence'), "step-evidence/{$user->id}");

        $existing = StepEntry::where('user_id', $user->id)->where('date', $date)->first();

        if ($existing) {
            Storage::disk('public')->delete($existing->evidence_path);
            $existing->update([
                'steps' => $request->integer('steps'),
                'evidence_path' => $path,
            ]);
        } else {
            StepEntry::create([
                'user_id' => $user->id,
                'date' => $date,
                'steps' => $request->integer('steps'),
                'evidence_path' => $path,
            ]);
        }

        $nowUnlocked = StepStats::unlockedAchievements($user->stepEntries()->orderBy('date')->get());
        $newAchievements = array_values(array_diff($nowUnlocked, $previouslyUnlocked));

        return redirect()->route('home')->with('newAchievements', $newAchievements);
    }
}
