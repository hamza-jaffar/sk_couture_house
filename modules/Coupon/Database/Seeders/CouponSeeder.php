<?php

namespace Modules\Coupon\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Coupon\Enum\DiscountTypeEnum;
use Modules\Coupon\Models\Coupon;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $coupons = [
            [
                'code' => 'WELCOME10',
                'description' => '10% off for first time customers',
                'discount_type' => DiscountTypeEnum::Percentage,
                'discount_value' => 10.00,
                'min_spend' => 30.00,
                'max_discount' => 50.00,
                'usage_limit' => 1000,
                'usage_limit_per_user' => 1,
                'starts_at' => now(),
                'expires_at' => now()->addYear(),
                'is_active' => true,
            ],
            [
                'code' => 'SUMMER25',
                'description' => 'Summer season discount',
                'discount_type' => DiscountTypeEnum::Percentage,
                'discount_value' => 25.00,
                'min_spend' => 75.00,
                'max_discount' => 100.00,
                'usage_limit' => 500,
                'usage_limit_per_user' => 2,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(3),
                'is_active' => true,
            ],
            [
                'code' => 'VIP50',
                'description' => '$50 flat off for orders over $200',
                'discount_type' => DiscountTypeEnum::Fixed,
                'discount_value' => 50.00,
                'min_spend' => 200.00,
                'max_discount' => null,
                'usage_limit' => 100,
                'usage_limit_per_user' => 1,
                'starts_at' => now(),
                'expires_at' => now()->addMonths(6),
                'is_active' => true,
            ],
            [
                'code' => 'FLASH15',
                'description' => 'Weekend flash sale',
                'discount_type' => DiscountTypeEnum::Fixed,
                'discount_value' => 15.00,
                'min_spend' => 50.00,
                'max_discount' => null,
                'usage_limit' => 200,
                'usage_limit_per_user' => 1,
                'starts_at' => now(),
                'expires_at' => now()->addDays(7),
                'is_active' => true,
            ],
        ];

        foreach ($coupons as $coupon) {
            Coupon::query()->firstOrCreate(
                ['code' => $coupon['code']],
                $coupon,
            );
        }
    }
}
