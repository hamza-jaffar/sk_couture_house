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
            'roles.view',
            'roles.create',
            'roles.update',
            'roles.delete',
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
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
