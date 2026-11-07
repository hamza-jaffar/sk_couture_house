<?php

namespace Modules\User\Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Seed the User module's roles and permissions.
     */
    public function run(): void
    {
        $permissions = collect([
            'users.view',
            'users.create',
            'users.update',
            'users.delete',
        ])->map(
            fn (string $name): Permission => Permission::findOrCreate($name, 'web'),
        );

        $adminRole = Role::findOrCreate('admin', 'web');
        $adminRole->syncPermissions($permissions);

        Role::findOrCreate('customer', 'web');
    }
}
