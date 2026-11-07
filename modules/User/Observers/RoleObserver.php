<?php

namespace Modules\User\Observers;

use Modules\User\Models\Role;
use Modules\User\Services\UserListingCache;

class RoleObserver
{
    public function __construct(private UserListingCache $listingCache) {}

    public function saved(Role $role): void
    {
        if ($role->wasChanged()) {
            $this->listingCache->invalidateAfterCommit();
        }
    }

    public function deleted(Role $role): void
    {
        $this->listingCache->invalidateAfterCommit();
    }
}
