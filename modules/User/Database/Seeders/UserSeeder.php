<?php

namespace Modules\User\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\User\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Seed a local development administrator.
     */
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        $seededAdmin = User::factory()->make([
            'name' => 'Hamza Jaffar',
            'email' => 'hamzajaffer789@gmail.com',
            'password' => 'password123',
        ]);

        $admin = User::query()->firstOrCreate(
            ['email' => $seededAdmin->email],
            [
                'name' => $seededAdmin->name,
                'password' => $seededAdmin->password,
            ],
        );

        $admin->syncRoles(['admin']);
    }
}
