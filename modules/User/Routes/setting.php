<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\Settings\ProfileController;

Route::middleware('auth')->group(function () {
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

        Route::inertia('/appearance', 'settings/appearance')->name('appearance');
    });
});
