<?php

use App\Http\Controllers\FormController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\StepEntryController;
use App\Http\Middleware\EnsureJourneyIsComplete;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('v2', fn () => Inertia::render('welcome'))->name('v2');

Route::middleware(['auth'])->group(function () {
    Route::get('form', [FormController::class, 'index'])->name('form.index');
    Route::get('form/{step}', [FormController::class, 'show'])->whereNumber('step')->name('form.show');
    Route::post('form/{step}', [FormController::class, 'update'])->whereNumber('step')->name('form.update');
    Route::post('form/reset', [FormController::class, 'reset'])->name('form.reset');
    Route::get('review', [FormController::class, 'review'])->name('form.review');

    Route::middleware(EnsureJourneyIsComplete::class)->group(function () {
        Route::post('steps', [StepEntryController::class, 'store'])->name('steps.store');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/v1.php';
