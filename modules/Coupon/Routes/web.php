<?php

use Illuminate\Support\Facades\Route;
use Modules\Coupon\Http\Controllers\CouponController;

Route::prefix('dashboard/coupons')->name('dashboard.coupons.')->middleware('auth')->group(function () {
    Route::get('/', [CouponController::class, 'index'])
        ->middleware('can:coupons.view')
        ->name('index');
    Route::post('/', [CouponController::class, 'store'])
        ->middleware('can:coupons.create')
        ->name('store');
    Route::delete('/bulk', [CouponController::class, 'bulkDestroy'])
        ->middleware('can:coupons.delete')
        ->name('bulk-destroy');
    Route::post('/bulk/restore', [CouponController::class, 'bulkRestore'])
        ->middleware('can:coupons.delete')
        ->name('bulk-restore');
    Route::delete('/bulk/force-delete', [CouponController::class, 'bulkForceDelete'])
        ->middleware('can:coupons.delete')
        ->name('bulk-force-delete');
    Route::patch('/{coupon}', [CouponController::class, 'update'])
        ->middleware('can:coupons.update')
        ->name('update');
    Route::delete('/{coupon}', [CouponController::class, 'destroy'])
        ->middleware('can:coupons.delete')
        ->name('destroy');
    Route::post('/{coupon}/restore', [CouponController::class, 'restore'])
        ->middleware('can:coupons.delete')
        ->withTrashed()
        ->name('restore');
    Route::delete('/{coupon}/force-delete', [CouponController::class, 'forceDelete'])
        ->middleware('can:coupons.delete')
        ->withTrashed()
        ->name('force-delete');
});
