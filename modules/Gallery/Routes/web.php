<?php

use Modules\Gallery\Http\Controllers\GalleryController;

Route::prefix('dashboard/gallery')->name('dashboard.gallery.')->middleware('auth')->group(function () {
    Route::get('/', [GalleryController::class, 'index'])->name('index');
    Route::get('/picker', [GalleryController::class, 'picker'])->name('picker');
    Route::get('/media/{media:uuid}/download', [GalleryController::class, 'download'])
        ->middleware('can:gallery.view')
        ->name('download');
    Route::post('/upload', [GalleryController::class, 'upload'])
        ->middleware('can:gallery.upload')
        ->name('upload');
    Route::delete('/media', [GalleryController::class, 'destroy'])
        ->middleware('can:gallery.delete')
        ->name('destroy');
    Route::post('/media/restore', [GalleryController::class, 'restore'])
        ->middleware('can:gallery.restore')
        ->name('restore');
    Route::delete('/media/force-delete', [GalleryController::class, 'forceDelete'])
        ->middleware('can:gallery.force-delete')
        ->name('force-delete');
});
