<?php

namespace Modules\Customer\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Customer\Http\Requests\CustomerLoginRequest;
use Modules\Customer\Http\Requests\CustomerRegisterRequest;
use Modules\Customer\Services\CustomerAuthService;

class CustomerAuthController
{
    public function __construct(
        protected CustomerAuthService $authService,
    ) {}

    /**
     * Show customer login page.
     */
    public function showLogin(Request $request): Response|RedirectResponse
    {
        if ($request->user('customer')) {
            return redirect()->route('customer.account');
        }

        return Inertia::render('frontend/customer/login');
    }

    /**
     * Handle customer login attempt.
     */
    public function login(CustomerLoginRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $success = $this->authService->login(
            $validated['email'],
            $validated['password'],
            (bool) ($validated['remember'] ?? false),
        );

        if (! $success) {
            throw ValidationException::withMessages([
                'email' => __('The provided credentials do not match our records or your account is deactivated.'),
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('customer.account'))
            ->with('success', 'Welcome back!');
    }

    /**
     * Show customer registration page.
     */
    public function showRegister(Request $request): Response|RedirectResponse
    {
        if ($request->user('customer')) {
            return redirect()->route('customer.account');
        }

        return Inertia::render('frontend/customer/register');
    }

    /**
     * Handle customer registration.
     */
    public function register(CustomerRegisterRequest $request): RedirectResponse
    {
        $this->authService->register($request->validated());

        $request->session()->regenerate();

        return redirect()->route('customer.account')
            ->with('success', 'Your client account has been created successfully.');
    }

    /**
     * Log out the customer.
     */
    public function logout(Request $request): RedirectResponse
    {
        $this->authService->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home')->with('success', 'You have been signed out.');
    }
}
