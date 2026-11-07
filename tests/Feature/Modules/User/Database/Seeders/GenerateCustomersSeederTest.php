<?php

use Modules\User\Database\Seeders\GenerateCustomersSeeder;
use Modules\User\Models\Role;
use Modules\User\Models\User;

it('appends each batch after the existing customer sequence', function () {
    $customerRole = Role::query()->firstOrCreate(
        ['name' => 'customer', 'guard_name' => 'web'],
        ['is_system' => true],
    );

    User::factory()
        ->count(2)
        ->create()
        ->each(fn (User $customer) => $customer->assignRole($customerRole));

    $seeder = app(GenerateCustomersSeeder::class);
    $seeder->append(3);
    $seeder->append(3);

    expect(User::query()->role('customer')->count())->toBe(8)
        ->and(User::query()->role('customer')->where('email', 'like', '%.customer00003@example.test')->exists())->toBeTrue()
        ->and(User::query()->role('customer')->where('email', 'like', '%.customer00008@example.test')->exists())->toBeTrue();
});

it('rejects an append batch with no customers', function () {
    $seeder = app(GenerateCustomersSeeder::class);

    expect(fn () => $seeder->append(0))
        ->toThrow(InvalidArgumentException::class, 'Customer count must be greater than zero.');
});
