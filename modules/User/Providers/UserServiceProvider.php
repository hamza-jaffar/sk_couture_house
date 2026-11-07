<?php

namespace Modules\User\Providers;

use Illuminate\Support\ServiceProvider;
use Modules\User\Models\Role;
use Modules\User\Models\User;
use Modules\User\Observers\RoleObserver;
use Modules\User\Observers\UserObserver;
use Modules\User\Services\UserListingCache;
use Spatie\Permission\Events\RoleAttachedEvent;
use Spatie\Permission\Events\RoleDetachedEvent;

class UserServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
        $this->app->register(RouteServiceProvider::class);

        User::observe($this->app->make(UserObserver::class));
        Role::observe($this->app->make(RoleObserver::class));

        $invalidateUserListings = function (object $event): void {
            if ($event instanceof RoleAttachedEvent || $event instanceof RoleDetachedEvent) {
                if ($event->model instanceof User) {
                    $this->app->make(UserListingCache::class)->invalidateAfterCommit();
                }
            }
        };

        $this->app['events']->listen(RoleAttachedEvent::class, $invalidateUserListings);
        $this->app['events']->listen(RoleDetachedEvent::class, $invalidateUserListings);
    }
}
