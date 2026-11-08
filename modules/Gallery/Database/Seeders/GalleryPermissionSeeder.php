<?php

namespace Modules\Gallery\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\User\Models\Role;
use Spatie\Permission\Models\Permission;

class GalleryPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::query()->firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'web'],
            ['is_system' => true],
        );

        $permissions = collect([
            'gallery.view',
            'gallery.upload',
            'gallery.delete',
            'gallery.restore',
            'gallery.force-delete',
        ])->map(fn (string $name) => Permission::findOrCreate($name, 'web'));

        $adminRole->givePermissionTo($permissions);
    }
}
