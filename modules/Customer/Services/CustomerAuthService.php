<?php

namespace Modules\Customer\Services;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Modules\Customer\Models\Customer;

class CustomerAuthService
{
    /**
     * Register a new customer and log them in.
     *
     * @param  array{
     *     name: string,
     *     email: string,
     *     password: string,
     *     phone?: string|null,
     *     shipping_address?: array<string, string>|null
     * }  $data
     */
    public function register(array $data): Customer
    {
        return DB::transaction(function () use ($data): Customer {
            $customer = Customer::query()->create([
                'name' => trim($data['name']),
                'email' => strtolower(trim($data['email'])),
                'password' => Hash::make($data['password']),
                'phone' => isset($data['phone']) ? trim($data['phone']) : null,
                'shipping_address' => $data['shipping_address'] ?? null,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            Auth::guard('customer')->login($customer, true);

            return $customer;
        });
    }

    /**
     * Authenticate customer credentials.
     */
    public function login(string $email, string $password, bool $remember = false): bool
    {
        $credentials = [
            'email' => strtolower(trim($email)),
            'password' => $password,
            'is_active' => true,
        ];

        return Auth::guard('customer')->attempt($credentials, $remember);
    }

    /**
     * Log out customer.
     */
    public function logout(): void
    {
        Auth::guard('customer')->logout();
    }

    /**
     * Update customer profile info.
     *
     * @param  array{
     *     name: string,
     *     phone?: string|null,
     *     shipping_address?: array<string, string>|null
     * }  $data
     */
    public function updateProfile(Customer $customer, array $data): Customer
    {
        return DB::transaction(function () use ($customer, $data): Customer {
            $customer->update([
                'name' => trim($data['name']),
                'phone' => isset($data['phone']) ? trim($data['phone']) : null,
                'shipping_address' => $data['shipping_address'] ?? $customer->shipping_address,
            ]);

            return $customer->fresh();
        });
    }

    /**
     * Update customer password with verification.
     */
    public function updatePassword(Customer $customer, string $currentPassword, string $newPassword): void
    {
        if (! Hash::check($currentPassword, $customer->password)) {
            throw ValidationException::withMessages([
                'current_password' => __('The provided current password does not match our records.'),
            ]);
        }

        $customer->update([
            'password' => Hash::make($newPassword),
        ]);
    }
}
