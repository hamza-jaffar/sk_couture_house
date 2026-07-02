<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\SiteSettingRequest;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function index(Request $request)
    {
        return inertia('settings/settings', [
            'settings' => \App\Models\Setting::pluck('value', 'key')
        ]);
    }

    public function update(SiteSettingRequest $request)
    {
        try {
            foreach ($request->validated() as $key => $value) {
                \App\Models\Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value ?? '']
                );
            }
            return back()->with('success', 'Settings updated successfully.');
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
