<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Modules\Gallery\Database\Seeders\GalleryPermissionSeeder;
use Modules\User\Database\Seeders\RolePermissionSeeder;
use Modules\User\Database\Seeders\UserSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            GalleryPermissionSeeder::class,
            UserSeeder::class,
        ]);
    }
}
