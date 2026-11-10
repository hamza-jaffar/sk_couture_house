<?php

namespace Modules\Setting\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Modules\Setting\Services\SiteSettingService;

class SettingServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
        $this->app->register(RouteServiceProvider::class);

        $this->app->booted(function (): void {
            if (Schema::hasTable('site_settings')) {
                $this->app->make(SiteSettingService::class)->applyMailConfiguration();
            }
        });
    }
}
