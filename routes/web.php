<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return inertia('dashboard/dashboard');
    })->name('dashboard');
});
