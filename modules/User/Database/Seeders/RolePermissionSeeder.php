<?php

namespace Modules\User\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\User\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    /**
     * Seed the User module's roles and permissions.
     */
    public function run(): void
    {
        $permissions = collect([
            // --- ROLE ---
            'roles.view',
            'roles.create',
            'roles.update',
            'roles.delete',

            // --- CATEGORY ---
            'categories.view',
            'categories.create',
            'categories.update',
            'categories.delete',

            // --- PRODUCTS ---
            'products.view',
            'products.create',
            'products.update',
            'products.delete',

            // --- USER ---
            'users.view',
            'users.create',
            'users.update',
            'users.delete',

            // --- ORDERS & TRANSACTIONS ---
            'orders.view',
            'orders.create',
            'orders.update',
            'orders.delete',
            'orders.fulfill',
            'orders.refund',

            // --- CUSTOMERS ---
            'customers.view',
            'customers.create',
            'customers.update',
            'customers.delete',

            // --- DISCOUNTS & PROMOTIONS ---
            'coupons.view',
            'coupons.create',
            'coupons.update',
            'coupons.delete',

            // --- PRODUCT REVIEWS & MODERATION ---
            'reviews.view',
            'reviews.approve',
            'reviews.delete',

            // --- ANALYTICS & REPORTS ---
            'analytics.view',
            'reports.export',

            // --- STORE SETTINGS & CONFIGURATION ---
            'settings.view',
            'settings.update',
        ])->map(fn (string $name) => Permission::findOrCreate($name, 'web'));

        $adminRole = Role::query()->firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'web'],
            ['is_system' => true],
        );
        $adminRole->update(['is_system' => true]);
        $adminRole->syncPermissions($permissions);

        Role::query()->firstOrCreate(['name' => 'customer', 'guard_name' => 'web'], ['is_system' => true]);
    }
}
