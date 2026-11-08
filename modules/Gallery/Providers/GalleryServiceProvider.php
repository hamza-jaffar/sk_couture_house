<?php

namespace Modules\Gallery\Providers;

use Illuminate\Support\ServiceProvider;
use Modules\Gallery\Console\MigrateGalleryStorage;

class GalleryServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../Database/Migrations');
        $this->app->register(RouteServiceProvider::class);
        $this->commands([MigrateGalleryStorage::class]);
    }
}
