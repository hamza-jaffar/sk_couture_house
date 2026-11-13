<?php

namespace Modules\Coupon\Providers;

use Illuminate\Support\ServiceProvider;

class CouponServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
        $this->app->register(RouteServiceProvider::class);
    }
}
