<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\Auth\LoginController;

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'index'])->name('login');
    Route::post('/login', [LoginController::class, 'login']);
});
