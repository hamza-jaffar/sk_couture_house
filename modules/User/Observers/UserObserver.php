<?php

namespace Modules\User\Observers;

use Modules\User\Models\User;
use Modules\User\Services\UserListingCache;

class UserObserver
{
    public function __construct(private UserListingCache $listingCache) {}

    public function saved(User $user): void
    {
        if ($user->wasChanged()) {
            $this->listingCache->invalidateAfterCommit();
        }
    }

    public function deleted(User $user): void
    {
        $this->listingCache->invalidateAfterCommit();
    }
}
