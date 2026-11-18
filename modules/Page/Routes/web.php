<?php

use Illuminate\Support\Facades\Route;
use Modules\Page\Http\Controllers\FrontendPageController;
use Modules\Page\Http\Controllers\PageController;

// Admin dashboard page management
Route::middleware(['auth'])->prefix('dashboard')->group(function (): void {
    Route::middleware(['can:pages.view'])->group(function (): void {
        Route::get('/pages', [PageController::class, 'index'])->name('dashboard.pages.index');
    });

    Route::middleware(['can:pages.create'])->group(function (): void {
        Route::get('/pages/create', [PageController::class, 'create'])->name('dashboard.pages.create');
        Route::post('/pages', [PageController::class, 'store'])->name('dashboard.pages.store');
    });

    Route::middleware(['can:pages.update'])->group(function (): void {
        Route::get('/pages/{page}/edit', [PageController::class, 'edit'])->name('dashboard.pages.edit');
        Route::patch('/pages/{page}', [PageController::class, 'update'])->name('dashboard.pages.update');
    });

    Route::middleware(['can:pages.delete'])->group(function (): void {
        Route::delete('/pages/{page}', [PageController::class, 'destroy'])->name('dashboard.pages.destroy');
    });
});

// Public storefront view
Route::middleware(['frontend'])->group(function (): void {
    Route::get('/page/{slug}', [FrontendPageController::class, 'show'])->name('page.show');
});
