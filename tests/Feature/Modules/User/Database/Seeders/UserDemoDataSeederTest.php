<?php

use Illuminate\Support\Facades\DB;
use Modules\User\Database\Seeders\UserDemoDataSeeder;
use Modules\User\Models\Role;
use Modules\User\Models\User;
use Spatie\Permission\Models\Permission;

it('seeds demo roles and staff users idempotently without customer data', function () {
    $this->seed(UserDemoDataSeeder::class);

    $demoRoleNames = [
        'Store Manager',
        'Sales Associate',
        'Inventory Specialist',
        'Order Coordinator',
        'Customer Support',
        'Marketing Specialist',
        'Content Editor',
        'Product Curator',
        'Finance Assistant',
        'Operations Lead',
        'Warehouse Associate',
        'Returns Specialist',
        'Catalog Manager',
        'Analytics Viewer',
        'Promotion Manager',
    ];
    $sampleStaffUser = User::query()
        ->where('email', 'like', '%.staff%@example.test')
        ->firstOrFail();

    expect(Role::query()->whereIn('name', $demoRoleNames)->count())->toBe(15)
        ->and(User::query()->where('email', 'like', '%.staff%@example.test')->count())->toBe(49)
        ->and(User::query()->where('email', 'like', '%.customer%@example.test')->count())->toBe(0)
        ->and(Role::query()->where('name', 'customer')->exists())->toBeFalse()
        ->and(Permission::query()->where('name', 'customers.view')->exists())->toBeFalse()
        ->and($sampleStaffUser->name)->toContain(' ')
        ->and($sampleStaffUser->email)->toContain('.staff')
        ->and($sampleStaffUser->email)->toEndWith('@example.test')
        ->and(DB::table('model_has_roles')
            ->where('model_type', (new User)->getMorphClass())
            ->count())->toBe(49);

    $this->seed(UserDemoDataSeeder::class);

    expect(Role::query()->whereIn('name', $demoRoleNames)->count())->toBe(15)
        ->and(User::query()->where('email', 'like', '%.staff%@example.test')->count())->toBe(49)
        ->and(User::query()->where('email', 'like', '%.customer%@example.test')->count())->toBe(0);
});

it('refuses to seed demo data outside local and testing environments', function () {
    $this->app->detectEnvironment(static fn (): string => 'production');

    expect(fn () => app(UserDemoDataSeeder::class)->run())
        ->toThrow(RuntimeException::class);
});
