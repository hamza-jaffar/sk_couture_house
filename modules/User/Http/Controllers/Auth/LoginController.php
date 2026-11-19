<?php

namespace Modules\User\Http\Controllers\Auth;

use Auth;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Modules\User\Http\Requests\LoginRequest;

class LoginController
{
    /**
     * Unified login page.
     *
     * - GET /login             → customer login UI
     * - GET /login?for=staff   → staff login UI
     * - GET /login?for="staff" → staff login UI
     */
    public function index(Request $request)
    {
        $for = trim((string) $request->query('for'), '"\'');

        if ($for === 'staff') {
            if (Auth::guard('web')->check()) {
                return redirect()->intended('dashboard');
            }

            return inertia('auth/login');
        }

        // Redirect already-authenticated customers to their account
        if ($request->user('customer')) {
            return redirect()->route('customer.account');
        }

        return inertia('frontend/customer/login');
    }

    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        $remember = isset($credentials['remember']);
        unset($credentials['remember']);

        if (Auth::attempt($credentials, $remember)) {
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
