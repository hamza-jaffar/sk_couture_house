<?php

namespace Modules\User\Http\Controllers\Auth;

use Auth;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Modules\User\Http\Requests\LoginRequest;

class LoginController
{
    public function index()
    {
        return inertia('auth/login');
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();

            return redirect()->intended('dashboard');
        }

        throw ValidationException::withMessages([
            'email' => __('auth.failed'),
        ]);
    }

    public function destroy(Request $request)
    {
        Auth::logout();

        // Invalidate the session and regenerate the CSRF token
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
