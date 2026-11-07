<?php

use Database\Seeders\DatabaseSeeder;
use Modules\User\Models\User;

it('seeds module roles, permissions, and a factory-backed admin idempotently', function () {
    $this->seed(DatabaseSeeder::class);
    $this->seed(DatabaseSeeder::class);

    $admin = User::query()->firstOrFail();

    expect($admin->hasRole('admin'))->toBeTrue();
    expect($admin->hasPermissionTo('users.view'))->toBeTrue();

    $this->assertDatabaseCount('roles', 2);
    $this->assertDatabaseCount('permissions', 8);
    $this->assertDatabaseCount('users', 1);
});
