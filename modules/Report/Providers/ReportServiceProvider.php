<?php

namespace Modules\Report\Providers;

use Illuminate\Support\ServiceProvider;

class ReportServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->app->register(RouteServiceProvider::class);
    }
}
