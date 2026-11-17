<?php

namespace Modules\Order\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\Order\Enum\OrderStatusEnum;
use Modules\Order\Models\Order;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 500, 15000);

        return [
            'order_number' => 'ORD-'.date('Ymd').'-'.strtoupper(Str::random(5)),
            'type' => 'direct',
            'status' => fake()->randomElement(OrderStatusEnum::cases())->value,
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->phoneNumber(),
            'shipping_address' => [
                'line1' => fake()->streetAddress(),
                'city' => fake()->city(),
                'region' => fake()->state(),
                'postal_code' => fake()->postcode(),
                'country' => 'Pakistan',
            ],
            'notes' => fake()->optional()->sentence(),
            'subtotal' => $subtotal,
            'total' => $subtotal,
            'currency' => 'PKR',
            'currency_icon' => 'Rs.',
            'payment_status' => 'pending',
            'payment_method' => 'cash_on_delivery',
            'metadata' => null,
            'user_id' => null,
        ];
    }
}
