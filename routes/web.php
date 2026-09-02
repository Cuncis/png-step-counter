<?php

use App\Http\Controllers\FormController;
use App\Http\Controllers\StepEntryController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [FormController::class, 'dashboard'])->name('dashboard');

    Route::get('form', [FormController::class, 'index'])->name('form.index');
    Route::get('form/{step}', [FormController::class, 'show'])->whereNumber('step')->name('form.show');
    Route::post('form/{step}', [FormController::class, 'update'])->whereNumber('step')->name('form.update');
    Route::post('form/reset', [FormController::class, 'reset'])->name('form.reset');
    Route::get('review', [FormController::class, 'review'])->name('form.review');

    Route::get('steps', [StepEntryController::class, 'index'])->name('steps.index');
    Route::post('steps', [StepEntryController::class, 'store'])->name('steps.store');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
