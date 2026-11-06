<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', function () {
        return response()->json([
            'message' => 'Welcome to Dashboard',
            'user' => auth()->user() ?? '',
        ], 200);
    })->name('dashboard');
});
