<?php

namespace Modules\User\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Modules\User\Models\Role;
use Modules\User\Models\User;
use Modules\User\Services\UserListingCache;
use RuntimeException;

class CustomerDemoDataSeeder extends Seeder
{
    protected const int CUSTOMER_COUNT = 10_000;

    protected const int CUSTOMER_BATCH_SIZE = 100;

    public function run(): void
    {
        $this->ensureDemoEnvironment();

        $customerRole = Role::query()
            ->where('name', 'customer')
            ->where('guard_name', 'web')
            ->firstOrFail();

        $this->seedCustomers($customerRole, 1, self::CUSTOMER_COUNT);
        app(UserListingCache::class)->invalidateAfterCommit();
    }

    protected function ensureDemoEnvironment(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new RuntimeException('Demo data can only be seeded in local or testing environments.');
        }
    }

    protected function seedCustomers(Role $customerRole, int $firstNumber, int $count): void
    {
        if ($firstNumber < 1 || $count < 1) {
            throw new InvalidArgumentException('Customer sequence and count must be greater than zero.');
        }

        $userModel = new User;
        $userTable = $userModel->getTable();
        $pivotTable = config('permission.table_names.model_has_roles');
        $roleColumn = config('permission.column_names.role_pivot_key') ?: 'role_id';
        $modelColumn = config('permission.column_names.model_morph_key') ?: 'model_id';
        $endNumber = $firstNumber + $count - 1;

        for ($batchStart = $firstNumber; $batchStart <= $endNumber; $batchStart += self::CUSTOMER_BATCH_SIZE) {
            $numbers = range(
                $batchStart,
                min($batchStart + self::CUSTOMER_BATCH_SIZE - 1, $endNumber),
            );
            $identities = array_map(
                fn (int $number): array => $this->demoIdentity($number),
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
    private function demoIdentity(int $number): array
    {
        fake()->seed(200_000 + $number);
        $name = fake()->name();
        $emailName = Str::slug($name, '.');

        return [
            'name' => $name,
            'email' => sprintf('%s.customer%05d@example.test', $emailName, $number),
        ];
    }
}
