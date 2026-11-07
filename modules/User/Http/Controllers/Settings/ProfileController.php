<?php

namespace Modules\User\Http\Controllers\Settings;

use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Modules\User\Http\Requests\Settings\ProfileUpdateRequest;
use Modules\User\Services\Settings\ProfileService;

class ProfileController
{
    public function __construct(private ProfileService $profileService) {}

    public function index()
    {
        return inertia('settings/profile');
    }

    public function update(ProfileUpdateRequest $request)
    {
        try {
            $this->profileService->update($request);

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => __('Profile updated successfully'),
            ]);

            return redirect()->back();
        } catch (\Exception $e) {

            Log::error('PROFILE UPDATE: '.$e);

            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Fail to update profile. Please try again'),
            ]);

            return redirect()->back();
        }
    }
}
