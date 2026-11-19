<?php

use Illuminate\Support\Facades\Route;
use Modules\Customer\Http\Controllers\CustomerAccountController;
use Modules\Customer\Http\Controllers\CustomerAuthController;
use Modules\Customer\Http\Controllers\CustomerController;

Route::middleware('frontend')->group(function (): void {
    // Customer login POST — form action stays at /customer/login
    Route::post('/customer/login', [CustomerAuthController::class, 'login'])->name('customer.login.post');

    // Backward compatibility redirects
    Route::get('/customer/login', fn () => redirect()->to('/login'))->name('customer.login');
    Route::get('/customer/register', fn () => redirect()->to('/register'));

    // Customer register — moved from /customer/register to /register
    Route::get('/register', [CustomerAuthController::class, 'showRegister'])->name('customer.register');
    Route::post('/register', [CustomerAuthController::class, 'register'])->name('customer.register.post');

    // Authenticated Customer Account Area
    Route::prefix('customer')->name('customer.')->middleware('auth:customer')->group(function (): void {
        Route::post('/logout', [CustomerAuthController::class, 'logout'])->name('logout');
        Route::get('/account', [CustomerAccountController::class, 'account'])->name('account');
        Route::patch('/profile', [CustomerAccountController::class, 'updateProfile'])->name('profile.update');
        Route::put('/password', [CustomerAccountController::class, 'updatePassword'])->name('password.update');
        Route::get('/orders', [CustomerAccountController::class, 'orders'])->name('orders');
        Route::get('/orders/{orderNumber}', [CustomerAccountController::class, 'orderDetail'])->name('orders.show');
    });
});

// ─── Dashboard Customers (Auth:web + Permissions) ─────────────────────────
Route::prefix('dashboard/customers')->name('dashboard.customers.')->middleware(['auth'])->group(function (): void {
    Route::get('/', [CustomerController::class, 'index'])
        ->middleware('can:customers.view')
        ->name('index');

    Route::get('/{customer}', [CustomerController::class, 'show'])
        ->middleware('can:customers.view')
        ->name('show');

    Route::patch('/{customer}/status', [CustomerController::class, 'updateStatus'])
        ->middleware('can:customers.update')
        ->name('update-status');
});
