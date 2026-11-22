<?php

use Illuminate\Support\Facades\Route;
use Modules\Banner\Http\Controllers\BannerController;

Route::prefix('dashboard/banners')->name('dashboard.banners.')->middleware('auth')->group(function (): void {
    Route::get('/', [BannerController::class, 'index'])
        ->middleware('can:banners.view')
        ->name('index');

    Route::post('/', [BannerController::class, 'store'])
        ->middleware('can:banners.create')
        ->name('store');

    Route::patch('/reorder', [BannerController::class, 'reorder'])
        ->middleware('can:banners.update')
        ->name('reorder');

    Route::delete('/bulk', [BannerController::class, 'bulkDestroy'])
        ->middleware('can:banners.delete')
        ->name('bulk-destroy');

    Route::post('/bulk/restore', [BannerController::class, 'bulkRestore'])
        ->middleware('can:banners.delete')
        ->name('bulk-restore');

    Route::delete('/bulk/force-delete', [BannerController::class, 'bulkForceDelete'])
        ->middleware('can:banners.delete')
        ->name('bulk-force-delete');

    Route::patch('/{banner}', [BannerController::class, 'update'])
        ->middleware('can:banners.update')
        ->name('update');

    Route::patch('/{banner}/toggle-status', [BannerController::class, 'toggleStatus'])
        ->middleware('can:banners.update')
        ->name('toggle-status');

    Route::delete('/{banner}', [BannerController::class, 'destroy'])
        ->middleware('can:banners.delete')
        ->name('destroy');

    Route::post('/{id}/restore', [BannerController::class, 'restore'])
        ->middleware('can:banners.delete')
        ->name('restore');

    Route::delete('/{id}/force-delete', [BannerController::class, 'forceDelete'])
        ->middleware('can:banners.delete')
        ->name('force-delete');
});
