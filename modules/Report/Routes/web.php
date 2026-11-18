<?php

use Illuminate\Support\Facades\Route;
use Modules\Report\Http\Controllers\DashboardController;
use Modules\Report\Http\Controllers\ReportController;

Route::middleware(['auth'])->prefix('dashboard')->group(function (): void {
    // Main dashboard overview
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Reports module
    Route::middleware(['can:analytics.view'])->group(function (): void {
        Route::get('/reports', [ReportController::class, 'index'])->name('dashboard.reports');
    });

    Route::middleware(['can:reports.export'])->group(function (): void {
        Route::get('/reports/export/{type}', [ReportController::class, 'export'])->name('dashboard.reports.export');
    });
});
