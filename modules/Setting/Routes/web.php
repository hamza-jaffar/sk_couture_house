<?php

use Modules\Setting\Http\Controllers\SettingController;

Route::middleware(['auth', 'can:settings.view'])
    ->prefix('settings/platform')
    ->name('settings.platform.')
    ->group(function (): void {
        Route::get('/', [SettingController::class, 'index'])->name('index');
        Route::patch('/{group}', [SettingController::class, 'update'])
            ->whereIn('group', ['general', 'contact', 'social', 'mail', 'variants'])
            ->middleware('can:settings.update')
            ->name('update');
    });
