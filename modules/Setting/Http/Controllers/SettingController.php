<?php

namespace Modules\Setting\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Setting\Http\Requests\UpdatePlatformSettingsRequest;
use Modules\Setting\Services\SiteSettingService;

class SettingController
{
    public function __construct(private SiteSettingService $settings) {}

    public function index(Request $request): Response
    {
        $validTabs = ['general', 'contact', 'social', 'mail', 'variants'];
        $selectedTab = $request->query('selected_tag', 'general');

        return Inertia::render('settings/settings', [
            'settings' => $this->settings->all(),
            'selectedTab' => in_array($selectedTab, $validTabs, true)
                ? $selectedTab
                : 'general',
        ]);
    }

    public function update(
        UpdatePlatformSettingsRequest $request,
        string $group,
    ): RedirectResponse {
        $this->settings->update($group, $request->validated());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Settings saved successfully.'),
        ]);

        return back();
    }
}
