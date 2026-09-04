<?php

namespace App\Http\Controllers;

use App\Http\Requests\SaveFormStepRequest;
use App\Models\FormSubmission;
use App\Support\FormSteps;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FormController extends Controller
{
    public function index(Request $request): RedirectResponse
    {
        $submission = $this->currentSubmission($request);

        return redirect()->route('form.show', ['step' => FormSteps::clamp($submission->current_step)]);
    }

    public function show(Request $request, int $step): Response
    {
        $step = FormSteps::clamp($step);
        $submission = $this->currentSubmission($request);

        return Inertia::render('form/show', [
            'step' => FormSteps::find($step),
            'totalSteps' => FormSteps::totalSteps(),
            'values' => $submission->steps[$step] ?? [],
        ]);
    }

    public function update(SaveFormStepRequest $request, int $step): RedirectResponse
    {
        $step = FormSteps::clamp($step);
        $submission = $this->currentSubmission($request);

        $steps = $submission->steps ?? [];
        $steps[$step] = $request->validated();

        $submission->update([
            'steps' => $steps,
            'current_step' => max($submission->current_step, min($step + 1, FormSteps::totalSteps())),
            'is_complete' => $submission->is_complete || $step === FormSteps::totalSteps(),
        ]);

        if ($step === FormSteps::totalSteps()) {
            return redirect()->route('form.review');
        }

        return redirect()->route('form.show', ['step' => $step + 1]);
    }

    public function review(Request $request): Response
    {
        return Inertia::render('form/review', [
            'steps' => FormSteps::all(),
            'submission' => $this->submissionProps($this->currentSubmission($request)),
        ]);
    }

    public function reset(Request $request): RedirectResponse
    {
        $this->currentSubmission($request)->update([
            'steps' => [],
            'current_step' => 1,
            'is_complete' => false,
        ]);

        return redirect()->route('form.show', ['step' => 1]);
    }

    private function currentSubmission(Request $request): FormSubmission
    {
        return FormSubmission::firstOrCreate(
            ['user_id' => $request->user()->id],
            ['steps' => [], 'current_step' => 1, 'is_complete' => false],
        );
    }

    /**
     * @return array{current_step: int, is_complete: bool, steps: array<int|string, array<string, mixed>>}
     */
    private function submissionProps(FormSubmission $submission): array
    {
        return [
            'current_step' => $submission->current_step,
            'is_complete' => $submission->is_complete,
            'steps' => $submission->steps ?? [],
        ];
    }
}
