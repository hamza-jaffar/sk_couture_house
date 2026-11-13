<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Inertia\Middleware;
use Modules\Category\Enum\OrderTypeEnum;
use Modules\Setting\Services\SiteSettingService;

class HandleInertiaRequests extends Middleware
{
    public function __construct(
        private SiteSettingService $settings,
    ) {}

    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $general = $this->settings->all()['general'];

        // Share favicon URL and store name with the Blade root template
        View::share('favicon_url', $general['favicon_url'] ?? null);
        View::share('site_name', $general['name'] ?? config('app.name'));

        return [
            ...parent::share($request),
            'name' => $general['name'] ?? config('app.name'),
            'auth' => [
                'user' => $user,
                'permissions' => $user?->getAllPermissions()
                    ->pluck('name')
                    ->sort()
                    ->values()
                    ->all() ?? [],
            ],
            'settings' => $this->settings->all(),
            'orderTypeOptions' => OrderTypeEnum::options(),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
