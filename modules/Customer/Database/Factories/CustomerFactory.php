<?php

namespace Modules\Customer\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Modules\Customer\Models\Customer;

/**
 * @extends Factory<Customer>
 */
class CustomerFactory extends Factory
{
    protected $model = Customer::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password123'),
            'phone' => fake()->phoneNumber(),
            'shipping_address' => [
                'line1' => fake()->streetAddress(),
                'city' => fake()->city(),
                'region' => fake()->state(),
                'postal_code' => fake()->postcode(),
                'country' => 'Pakistan',
            ],
            'is_active' => true,
            'email_verified_at' => now(),
            'remember_token' => Str::random(10),
        ];
    }
}
