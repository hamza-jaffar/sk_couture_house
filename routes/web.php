<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return inertia('dashboard/dashboard');
    })->name('dashboard');
});

Route::post('/toast', function () {
    Inertia::flash('toast', [
        'type' => 'info',
        'message' => __('Wohoo! Toast is working'),
    ]);
})->name('toast');
