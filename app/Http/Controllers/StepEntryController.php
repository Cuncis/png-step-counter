<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStepEntryRequest;
use App\Models\StepEntry;
use App\Support\StepStats;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StepEntryController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $entries = $user->stepEntries()->orderBy('date')->get();

        $today = today();
        $todayEntry = $entries->first(fn (StepEntry $entry) => $entry->date->isSameDay($today));

        $weekStart = $today->copy()->startOfWeek();
        $weekEnd = $today->copy()->endOfWeek();
        $weekEntries = StepStats::stepsByDate($entries, $weekStart, $weekEnd);

        $monthEntries = $entries->filter(fn (StepEntry $entry) => $entry->date->isSameMonth($today));
        $yearEntries = $entries->filter(fn (StepEntry $entry) => $entry->date->isSameYear($today));

        return Inertia::render('steps/index', [
            'today' => [
                'steps' => $todayEntry->steps ?? 0,
                'evidenceUrl' => $todayEntry?->evidenceUrl(),
            ],
            'week' => [
                // Cast to stdClass so an empty week still serializes as `{}`, not `[]`.
                'entries' => (object) $weekEntries->all(),
                'total' => $weekEntries->sum(),
                'daysRecorded' => $weekEntries->count(),
            ],
            'month' => [
                'total' => $monthEntries->sum('steps'),
                'daysRecorded' => $monthEntries->count(),
            ],
            'year' => [
                'total' => $yearEntries->sum('steps'),
                'daysRecorded' => $yearEntries->count(),
            ],
            'streakDays' => StepStats::currentStreak($entries),
            'achievements' => StepStats::achievementDefinitions(),
            'unlockedAchievements' => StepStats::unlockedAchievements($entries),
        ]);
    }

    public function store(StoreStepEntryRequest $request): RedirectResponse
    {
        $user = $request->user();
        $date = today();

        $path = $request->file('evidence')->store("step-evidence/{$user->id}", 'public');

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

        return redirect()->route('steps.index');
    }
}
