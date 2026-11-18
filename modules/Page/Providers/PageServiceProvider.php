<?php

namespace Modules\Page\Providers;

use Illuminate\Support\ServiceProvider;

class PageServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
        $this->app->register(RouteServiceProvider::class);
    }
}
