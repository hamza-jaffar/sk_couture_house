<?php

use Illuminate\Support\Facades\Route;
use Modules\Category\Http\Controllers\CategoryController;

Route::prefix('dashboard/collection')->name('dashboard.collection.')->middleware('auth')->group(function () {
    Route::get('/', [CategoryController::class, 'index'])
        ->middleware('can:collections.view')
        ->name('index');
    Route::post('/', [CategoryController::class, 'store'])
        ->middleware('can:collections.create')
        ->name('store');
    Route::delete('/bulk', [CategoryController::class, 'bulkDestroy'])
        ->middleware('can:collections.delete')
        ->name('bulk-destroy');
    Route::post('/bulk/restore', [CategoryController::class, 'bulkRestore'])
        ->middleware('can:collections.delete')
        ->name('bulk-restore');
    Route::delete('/bulk/force-delete', [CategoryController::class, 'bulkForceDelete'])
        ->middleware('can:collections.delete')
        ->name('bulk-force-delete');
    Route::patch('/{category}', [CategoryController::class, 'update'])
        ->middleware('can:collections.update')
        ->name('update');
    Route::delete('/{category}', [CategoryController::class, 'destroy'])
        ->middleware('can:collections.delete')
        ->name('destroy');
    Route::post('/{category}/restore', [CategoryController::class, 'restore'])
        ->middleware('can:collections.delete')
        ->withTrashed()
        ->name('restore');
    Route::delete('/{category}/force-delete', [CategoryController::class, 'forceDelete'])
        ->middleware('can:collections.delete')
        ->withTrashed()
        ->name('force-delete');
});
