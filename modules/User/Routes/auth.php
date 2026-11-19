<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\Auth\LoginController;

// Unified login page (serves customer login by default, staff login with ?for=staff)
Route::get('/login', [LoginController::class, 'index'])->name('login');

Route::middleware('guest')->group(function () {
    Route::post('/login', [LoginController::class, 'login'])->middleware('throttle:5,1');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
});
