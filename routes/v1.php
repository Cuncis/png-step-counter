<?php

use App\Http\Controllers\V1\ChallengeAdminController;
use App\Http\Controllers\V1\ChallengeDashboardController;
use App\Http\Controllers\V1\ChallengeStepEntryController;
use App\Http\Middleware\EnsureIsAdmin;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| v1: Regional Step Challenge Tracker (preview)
|--------------------------------------------------------------------------
|
| Self-contained MVP for a Malaysia/Philippines/Indonesia step challenge.
| Public dashboard + step logging need no login (per the MVP brief); the
| admin view is gated behind the existing auth + is_admin flag.
*/
Route::prefix('v1')->name('v1.')->group(function () {
    Route::get('/', [ChallengeDashboardController::class, 'index'])->name('dashboard');
    Route::post('/steps', [ChallengeStepEntryController::class, 'store'])->name('steps.store');

    Route::middleware(['auth', EnsureIsAdmin::class])->prefix('admin')->name('admin.')->group(function () {
        Route::get('/', [ChallengeAdminController::class, 'index'])->name('index');
        Route::put('/entries/{entry}', [ChallengeAdminController::class, 'update'])->name('entries.update');
        Route::delete('/entries/{entry}', [ChallengeAdminController::class, 'destroy'])->name('entries.destroy');
        Route::put('/goals', [ChallengeAdminController::class, 'updateGoals'])->name('goals.update');
        Route::get('/export', [ChallengeAdminController::class, 'export'])->name('export');
    });
});
