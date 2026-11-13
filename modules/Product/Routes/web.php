<?php

use Illuminate\Support\Facades\Route;
use Modules\Product\Http\Controller\ProductController;

Route::prefix('dashboard/product')->name('dashboard.product.')->middleware('auth')->group(function () {
    Route::get('/', [ProductController::class, 'index'])
        ->middleware('can:products.view')
        ->name('index');
    Route::get('/create', [ProductController::class, 'create'])
        ->middleware('can:products.create')
        ->name('create');
    Route::delete('/bulk', [ProductController::class, 'bulkDestroy'])
        ->middleware('can:products.delete')
        ->name('bulk-destroy');
    Route::post('/bulk/restore', [ProductController::class, 'bulkRestore'])
        ->middleware('can:products.delete')
        ->name('bulk-restore');
    Route::delete('/bulk/force-delete', [ProductController::class, 'bulkForceDelete'])
        ->middleware('can:products.delete')
        ->name('bulk-force-delete');
    Route::get('/{product}', [ProductController::class, 'show'])
        ->middleware('can:products.view')
        ->name('show');
    Route::get('/{product}/edit', [ProductController::class, 'edit'])
        ->middleware('can:products.update')
        ->name('edit');
    Route::post('/', [ProductController::class, 'store'])
        ->middleware('can:products.create')
        ->name('store');
    Route::patch('/{product}', [ProductController::class, 'update'])
        ->middleware('can:products.update')
        ->name('update');
    Route::delete('/{product}', [ProductController::class, 'destroy'])
        ->middleware('can:products.delete')
        ->name('destroy');
    Route::patch('/{product}/restore', [ProductController::class, 'restore'])
        ->withTrashed()
        ->middleware('can:products.delete')
        ->name('restore');
    Route::delete('/{product}/force-delete', [ProductController::class, 'forceDelete'])
        ->withTrashed()
        ->middleware('can:products.delete')
        ->name('forceDelete');
});
