<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\Settings\ProfileController;
use Modules\User\Http\Controllers\Settings\RolePermissionController;
use Modules\User\Http\Controllers\Settings\UserController;

Route::middleware('auth')->prefix('settings')->name('settings.')->group(function () {
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::inertia('/appearance', 'settings/appearance')->name('appearance');

    Route::get('/roles', [RolePermissionController::class, 'index'])->name('roles');
    Route::post('/roles', [RolePermissionController::class, 'store'])->name('roles.store');
    Route::delete('/roles', [RolePermissionController::class, 'bulkDestroy'])->name('roles.bulk-destroy');
    Route::patch('/roles/{role}', [RolePermissionController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{role}', [RolePermissionController::class, 'destroy'])->name('roles.destroy');

    Route::get('/users', [UserController::class, 'index'])->name('users');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::delete('/users', [UserController::class, 'bulkDestroy'])->name('users.bulk-destroy');
    Route::patch('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
});
