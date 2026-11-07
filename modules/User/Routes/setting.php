<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\Settings\ProfileController;
use Modules\User\Http\Controllers\Settings\RolePermissionController;

Route::middleware('auth')->prefix('settings')->name('settings.')->group(function () {
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::inertia('/appearance', 'settings/appearance')->name('appearance');

    Route::get('/roles', [RolePermissionController::class, 'index'])->name('roles');
    Route::post('/roles', [RolePermissionController::class, 'store'])->name('roles.store');
    Route::delete('/roles', [RolePermissionController::class, 'bulkDestroy'])->name('roles.bulk-destroy');
    Route::patch('/roles/{role}', [RolePermissionController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{role}', [RolePermissionController::class, 'destroy'])->name('roles.destroy');
});
