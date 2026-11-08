<?php

use Illuminate\Support\Facades\Route;
use Modules\User\Http\Controllers\Settings\ProfileController;
use Modules\User\Http\Controllers\Settings\RolePermissionController;
use Modules\User\Http\Controllers\Settings\UserController;

Route::middleware('auth')->prefix('settings')->name('settings.')->group(function () {
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::inertia('/appearance', 'settings/appearance')->name('appearance');

    Route::get('/roles', [RolePermissionController::class, 'index'])->middleware('can:roles.view')->name('roles');
    Route::post('/roles', [RolePermissionController::class, 'store'])->middleware('can:roles.create')->name('roles.store');
    Route::delete('/roles', [RolePermissionController::class, 'bulkDestroy'])->middleware('can:roles.delete')->name('roles.bulk-destroy');
    Route::patch('/roles/{role}', [RolePermissionController::class, 'update'])->middleware('can:roles.update')->name('roles.update');
    Route::delete('/roles/{role}', [RolePermissionController::class, 'destroy'])->middleware('can:roles.delete')->name('roles.destroy');

    Route::get('/users', [UserController::class, 'index'])->middleware('can:users.view')->name('users');
    Route::post('/users', [UserController::class, 'store'])->middleware('can:users.create')->name('users.store');
    Route::delete('/users', [UserController::class, 'bulkDestroy'])->middleware('can:users.delete')->name('users.bulk-destroy');
    Route::patch('/users/{user}', [UserController::class, 'update'])->middleware('can:users.update')->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('can:users.delete')->name('users.destroy');
});
