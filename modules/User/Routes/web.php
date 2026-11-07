<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\CustomerController;

Route::prefix('dashboard')->name('dashboard.')->middleware('auth')->group(function () {
    Route::prefix('customers')->name('customer.')->group(function () {
        Route::get('/', [CustomerController::class, 'index'])->name('index');
    });
});

require __DIR__.'/setting.php';
require __DIR__.'/auth.php';
