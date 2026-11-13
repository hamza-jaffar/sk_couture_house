<?php

use Illuminate\Support\Facades\Route;
use Modules\Review\Http\Controllers\ReviewController;

Route::prefix('dashboard/reviews')->name('dashboard.reviews.')->middleware('auth')->group(function () {
    Route::get('/', [ReviewController::class, 'index'])
        ->middleware('can:reviews.view')
        ->name('index');

    Route::post('/bulk/status', [ReviewController::class, 'bulkStatus'])
        ->middleware('can:reviews.approve')
        ->name('bulk-status');
    Route::delete('/bulk', [ReviewController::class, 'bulkDestroy'])
        ->middleware('can:reviews.delete')
        ->name('bulk-destroy');
    Route::post('/bulk/restore', [ReviewController::class, 'bulkRestore'])
        ->middleware('can:reviews.delete')
        ->name('bulk-restore');
    Route::delete('/bulk/force-delete', [ReviewController::class, 'bulkForceDelete'])
        ->middleware('can:reviews.delete')
        ->name('bulk-force-delete');

    Route::patch('/{review}/respond', [ReviewController::class, 'respond'])
        ->middleware('can:reviews.approve')
        ->name('respond');
    Route::patch('/{review}/status', [ReviewController::class, 'updateStatus'])
        ->middleware('can:reviews.approve')
        ->name('status');
    Route::delete('/{review}', [ReviewController::class, 'destroy'])
        ->middleware('can:reviews.delete')
        ->name('destroy');
    Route::post('/{review}/restore', [ReviewController::class, 'restore'])
        ->withTrashed()
        ->middleware('can:reviews.delete')
        ->name('restore');
    Route::delete('/{review}/force-delete', [ReviewController::class, 'forceDelete'])
        ->withTrashed()
        ->middleware('can:reviews.delete')
        ->name('force-delete');
});
