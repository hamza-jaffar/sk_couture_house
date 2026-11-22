<?php

use Illuminate\Support\Facades\Route;
use Modules\Newsletter\Http\Controllers\FrontendNewsletterController;
use Modules\Newsletter\Http\Controllers\NewsletterController;

// Storefront public subscription route
Route::middleware(['frontend'])->group(function (): void {
    Route::post('/newsletter/subscribe', [FrontendNewsletterController::class, 'subscribe'])
        ->middleware('throttle:10,1')
        ->name('newsletter.subscribe');
});

// Admin dashboard subscribers management
Route::prefix('dashboard/subscribers')->name('dashboard.subscribers.')->middleware('auth')->group(function (): void {
    Route::get('/', [NewsletterController::class, 'index'])
        ->middleware('can:newsletter.view')
        ->name('index');

    Route::get('/export', [NewsletterController::class, 'export'])
        ->middleware('can:newsletter.export')
        ->name('export');

    Route::patch('/{subscriber}/toggle-status', [NewsletterController::class, 'toggleStatus'])
        ->middleware('can:newsletter.view')
        ->name('toggle-status');

    Route::delete('/bulk', [NewsletterController::class, 'bulkDestroy'])
        ->middleware('can:newsletter.delete')
        ->name('bulk-destroy');

    Route::delete('/{subscriber}', [NewsletterController::class, 'destroy'])
        ->middleware('can:newsletter.delete')
        ->name('destroy');
});
