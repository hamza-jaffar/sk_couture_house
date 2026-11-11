<?php

namespace Modules\Product\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\Product\Models\Product;
use Modules\Product\Models\ProductVariant;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    protected $model = ProductVariant::class;

    public function definition(): array
    {
        $size = fake()->randomElement(['S', 'M', 'L', 'XL']);
        $color = fake()->safeColorName();
        $attributes = [
            'Size' => $size,
            'Color' => ucfirst($color),
        ];

        return [
            'product_id' => Product::factory(),
            'sku' => Str::upper('P-'.fake()->unique()->regexify('[A-F0-9]{24}')),
            'name' => "{$size} / ".ucfirst($color),
            'attributes' => $attributes,
            'image' => null,
        ];
    }

    public function forProduct(Product $product): static
    {
        return $this->state(fn (): array => ['product_id' => $product->id]);
    }
}
