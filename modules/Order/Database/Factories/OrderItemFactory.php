<?php

namespace Modules\Order\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Order\Models\Order;
use Modules\Order\Models\OrderItem;
use Modules\Product\Models\Product;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    public function definition(): array
    {
        $qty = fake()->numberBetween(1, 3);
        $price = fake()->randomFloat(2, 500, 5000);

        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'product_variant_id' => null,
            'product_title' => fake()->words(3, true),
            'product_slug' => fake()->slug(),
            'sku' => fake()->bothify('SKU-####-???'),
            'selected_options' => ['Size' => 'M'],
            'quantity' => $qty,
            'unit_price' => $price,
            'total_price' => $price * $qty,
            'image_url' => null,
        ];
    }
}
