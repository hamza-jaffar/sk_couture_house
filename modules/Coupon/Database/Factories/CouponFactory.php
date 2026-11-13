<?php

namespace Modules\Coupon\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\Coupon\Enum\DiscountTypeEnum;
use Modules\Coupon\Models\Coupon;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    protected $model = Coupon::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper(Str::random(8)),
            'description' => fake()->optional()->sentence(),
            'discount_type' => fake()->randomElement([DiscountTypeEnum::Percentage, DiscountTypeEnum::Fixed]),
            'discount_value' => fake()->randomElement([10.00, 15.00, 20.00, 25.00, 50.00]),
            'min_spend' => fake()->optional()->randomElement([25.00, 50.00, 100.00]),
            'max_discount' => fake()->optional()->randomElement([20.00, 50.00, 100.00]),
            'usage_limit' => fake()->optional()->numberBetween(10, 500),
            'usage_limit_per_user' => fake()->optional()->numberBetween(1, 5),
            'times_used' => 0,
            'starts_at' => now(),
            'expires_at' => now()->addDays(30),
            'is_active' => true,
        ];
    }

    public function percentage(float $value = 20.0): static
    {
        return $this->state(fn (): array => [
            'discount_type' => DiscountTypeEnum::Percentage,
            'discount_value' => $value,
        ]);
    }

    public function fixed(float $value = 15.0): static
    {
        return $this->state(fn (): array => [
            'discount_type' => DiscountTypeEnum::Fixed,
            'discount_value' => $value,
        ]);
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => [
            'is_active' => false,
        ]);
    }

    public function expired(): static
    {
        return $this->state(fn (): array => [
            'starts_at' => now()->subDays(60),
            'expires_at' => now()->subDays(1),
        ]);
    }
}
