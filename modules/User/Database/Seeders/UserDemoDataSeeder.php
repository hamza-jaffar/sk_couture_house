<?php

namespace Modules\User\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
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

    private const int STAFF_COUNT = 100;

    private const int CUSTOMER_COUNT = 10_000;

    private const int CUSTOMER_BATCH_SIZE = 100;

    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('Demo data can only be seeded in local or testing environments.');
        }

        $this->call(RolePermissionSeeder::class);

        $permissions = Permission::query()
            ->where('guard_name', 'web')
            ->get();

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

        $customerRole = Role::query()
            ->where('name', 'customer')
            ->where('guard_name', 'web')
            ->firstOrFail();

        $this->seedCustomers($customerRole);
    }

    private function seedCustomers(Role $customerRole): void
    {
        $userModel = new User;
        $userTable = $userModel->getTable();
        $pivotTable = config('permission.table_names.model_has_roles');
        $roleColumn = config('permission.column_names.role_pivot_key') ?: 'role_id';
        $modelColumn = config('permission.column_names.model_morph_key') ?: 'model_id';

        foreach (array_chunk(range(1, self::CUSTOMER_COUNT), self::CUSTOMER_BATCH_SIZE) as $numbers) {
            $identities = array_map(
                fn (int $number): array => $this->demoIdentity('customer', $number),
                $numbers,
            );
            $emails = array_column($identities, 'email');
            $legacyEmails = array_map(
                static fn (int $number): string => sprintf('demo-customer-%05d@example.test', $number),
                $numbers,
            );
            $existingUsers = User::query()
                ->whereIn('email', [...$legacyEmails, ...$emails])
                ->get()
                ->keyBy('email');
            $timestamp = now();
            $existingRecords = [];
            $newRecords = [];

            foreach ($numbers as $index => $number) {
                $identity = $identities[$index];
                $existingUser = $existingUsers->get($legacyEmails[$index])
                    ?? $existingUsers->get($identity['email']);

                if ($existingUser !== null) {
                    $existingRecords[] = array_merge(
                        $existingUser->getAttributes(),
                        $identity,
                        ['updated_at' => $timestamp],
                    );

                    continue;
                }

                $user = User::factory()->make($identity);
                $newRecords[] = array_merge($user->getAttributes(), [
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]);
            }

            if ($existingRecords !== []) {
                DB::table($userTable)->upsert(
                    $existingRecords,
                    ['id'],
                    ['name', 'email', 'updated_at'],
                );
            }

            if ($newRecords !== []) {
                DB::table($userTable)->insertOrIgnore($newRecords);
            }

            $userIds = User::query()->whereIn('email', $emails)->pluck('id')->all();

            if ($userIds === []) {
                continue;
            }

            DB::transaction(function () use ($customerRole, $modelColumn, $pivotTable, $roleColumn, $userIds, $userModel): void {
                DB::table($pivotTable)
                    ->where('model_type', $userModel->getMorphClass())
                    ->whereIn($modelColumn, $userIds)
                    ->delete();

                DB::table($pivotTable)->insert(array_map(
                    fn (int|string $userId): array => [
                        $roleColumn => $customerRole->getKey(),
                        $modelColumn => $userId,
                        'model_type' => $userModel->getMorphClass(),
                    ],
                    $userIds,
                ));
            });
        }
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
