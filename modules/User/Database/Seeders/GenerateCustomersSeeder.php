<?php

namespace Modules\User\Database\Seeders;

use InvalidArgumentException;
use Modules\User\Models\Role;
use Modules\User\Models\User;
use Modules\User\Services\UserListingCache;

class GenerateCustomersSeeder extends CustomerDemoDataSeeder
{
    private const int APPEND_COUNT = 500_000;

    public function run(): void
    {
        $this->append();
    }

    public function append(int $count = self::APPEND_COUNT): void
    {
        $this->ensureDemoEnvironment();

        if ($count < 1) {
            throw new InvalidArgumentException('Customer count must be greater than zero.');
        }

        $customerRole = Role::query()
            ->where('name', 'customer')
            ->where('guard_name', 'web')
            ->firstOrFail();
        $firstNumber = User::query()->role('customer')->count() + 1;

        $this->command?->info("Appending {$count} customers starting at {$firstNumber}...");
        $this->seedCustomers($customerRole, $firstNumber, $count);
        app(UserListingCache::class)->invalidateAfterCommit();
        $this->command?->info('Customer generation complete.');
    }
}
