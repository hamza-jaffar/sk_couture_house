<?php

use Illuminate\Support\Facades\Route;
use Modules\Order\Http\Controllers\CartController;
use Modules\Order\Http\Controllers\CheckoutController;
use Modules\Order\Http\Controllers\OrderController;
use Modules\Order\Http\Controllers\WhatsAppController;

// ─── Storefront Cart & Checkout (Frontend Middleware) ─────────────────────────
Route::middleware('frontend')->group(function (): void {
    Route::prefix('cart')->name('cart.')->group(function (): void {
        Route::get('/', [CartController::class, 'index'])->name('index');
        Route::post('/add', [CartController::class, 'add'])->name('add');
        Route::patch('/{key}', [CartController::class, 'update'])->name('update');
        Route::delete('/{key}', [CartController::class, 'remove'])->name('remove');
        Route::delete('/', [CartController::class, 'clear'])->name('clear');
        Route::post('/coupon', [CartController::class, 'applyCoupon'])->name('coupon.apply');
        Route::delete('/coupon/remove', [CartController::class, 'removeCoupon'])->name('coupon.remove');
    });

    Route::prefix('checkout')->name('checkout.')->group(function (): void {
        Route::get('/', [CheckoutController::class, 'index'])->name('index');
        Route::post('/', [CheckoutController::class, 'store'])->name('store');
        Route::get('/success/{order}', [CheckoutController::class, 'success'])->name('success');
    });

    Route::get('/whatsapp/redirect/{slug}', [WhatsAppController::class, 'redirect'])->name('whatsapp.redirect');
});

// ─── Dashboard Orders (Auth + Permissions) ────────────────────────────────────
Route::prefix('dashboard/orders')->name('dashboard.orders.')->middleware(['auth'])->group(function (): void {
    Route::get('/', [OrderController::class, 'index'])
        ->middleware('can:orders.view')
        ->name('index');

    Route::get('/{order}', [OrderController::class, 'show'])
        ->middleware('can:orders.view')
        ->name('show');

    Route::patch('/{order}/status', [OrderController::class, 'updateStatus'])
        ->middleware('can:orders.update')
        ->name('update-status');
});
