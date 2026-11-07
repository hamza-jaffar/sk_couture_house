<?php

namespace Modules\User\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Modules\User\Models\Role;
use Modules\User\Models\User;
use RuntimeException;
use Spatie\Permission\Models\Permission;

class UserDemoDataSeeder extends Seeder
{
    private const array DEMO_ROLE_NAMES = [
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

    private const int STAFF_COUNT = 49;

    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('Demo data can only be seeded in local or testing environments.');
        }

        $this->command->info('Seeding Roles & Permissions...');
        $this->call(RolePermissionSeeder::class);

        $permissions = Permission::query()
            ->where('guard_name', 'web')
            ->get();

        $this->command->info('Configuring Demo Roles...');
        $demoRoles = collect(self::DEMO_ROLE_NAMES)
            ->values()
            ->map(function (string $name, int $index) use ($permissions): Role {
                $legacyName = sprintf('demo-role-%02d', $index + 1);
                $role = Role::query()
                    ->where('name', $legacyName)
                    ->where('guard_name', 'web')
                    ->first();

                if ($role === null) {
                    $role = Role::query()->firstOrCreate(
                        ['name' => $name, 'guard_name' => 'web'],
                        ['is_system' => false],
                    );
                } else {
                    $role->forceFill([
                        'name' => $name,
                        'is_system' => false,
                    ])->save();
                }

                if ($permissions->isNotEmpty()) {
                    $role->syncPermissions(
                        $permissions->random(random_int(1, min(8, $permissions->count()))),
                    );
                }

                return $role;
            });

        $this->command->info('Seeding Staff Users...');
        foreach (range(1, self::STAFF_COUNT) as $number) {
            $identity = $this->demoIdentity('staff', $number);
            $legacyEmail = sprintf('demo-staff-%03d@example.test', $number);
            $user = User::query()
                ->whereIn('email', [$legacyEmail, $identity['email']])
                ->first();

            if ($user === null) {
                $user = User::factory()->make($identity);
            } else {
                $user->forceFill($identity);
            }

            $user->save();
            $user->syncRoles([$demoRoles->random()]);
        }
        $this->command->info('Seeding Staff Done');

        $this->command->info('Seeding Customers...');
        $this->call(CustomerDemoDataSeeder::class);
        $this->command->info('Seeding Customers Done');
    }

    /**
     * @return array{name: string, email: string}
     */
    private function demoIdentity(string $type, int $number): array
    {
        fake()->seed(($type === 'staff' ? 100_000 : 200_000) + $number);
        $name = fake()->name();
        $emailName = Str::slug($name, '.');

        return [
            'name' => $name,
            'email' => sprintf('%s.%s%05d@example.test', $emailName, $type, $number),
        ];
    }
}
