<?php

use Illuminate\Support\Facades\Route;

Route::middleware('frontend')->group(function () {
    Route::inertia('/', 'welcome')->name('home');
});

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return inertia('dashboard/dashboard');
    })->name('dashboard');
});
