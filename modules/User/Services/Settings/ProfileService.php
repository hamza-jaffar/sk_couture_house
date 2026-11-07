<?php

namespace Modules\User\Services\Settings;

use Modules\User\Http\Requests\Settings\ProfileUpdateRequest;

class ProfileService
{
    public function update(ProfileUpdateRequest $request)
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();
    }
}
