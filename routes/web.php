<?php

use Illuminate\Support\Facades\Route;

Route::middleware('frontend')->group(function () {
    Route::inertia('/', 'frontend/welcome')->name('home');
});
