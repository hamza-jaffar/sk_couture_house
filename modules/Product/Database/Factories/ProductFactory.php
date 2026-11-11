<?php

namespace Modules\Product\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\Category\Models\Category;
use Modules\Product\Models\Product;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $title = fake()->unique()->words(3, true);

        return [
            'title' => ucfirst($title),
            'slug' => Str::slug($title),
            'short_description' => fake()->paragraph(),
            'description' => '<p>'.fake()->paragraphs(2, true).'</p>',
            'price' => fake()->randomFloat(2, 10, 500),
            'sale_price' => null,
            'sale_start_at' => null,
            'sale_end_at' => null,
            'sku' => fake()->unique()->regexify('[A-Z]{3}-[0-9]{4}'),
            'stock' => fake()->numberBetween(0, 100),
            'type' => 'simple',
            'status' => 'published',
            'is_featured' => false,
            'category_id' => null,
            'metadata' => null,
            'images' => [],
            'variant_options' => [],
            'meta_title' => null,
            'meta_description' => null,
            'meta_keywords' => null,
            'canonical_url' => null,
            'og_title' => null,
            'og_description' => null,
            'og_image' => null,
            'robots_meta' => 'index, follow',
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (): array => ['status' => 'draft']);
    }

    public function published(): static
    {
        return $this->state(fn (): array => ['status' => 'published']);
    }

    public function archived(): static
    {
        return $this->state(fn (): array => ['status' => 'archived']);
    }

    public function featured(): static
    {
        return $this->state(fn (): array => ['is_featured' => true]);
    }

    public function forCategory(Category $category): static
    {
        return $this->state(fn (): array => ['category_id' => $category->id]);
    }

    public function simple(): static
    {
        return $this->state(fn (): array => [
            'type' => 'simple',
            'variant_options' => [],
        ]);
    }

    /**
     * @param  list<array{name: string, values: list<string>}>  $variantOptions
     */
    public function variable(array $variantOptions = [
        ['name' => 'Size', 'values' => ['S', 'M', 'L']],
    ]): static
    {
        return $this->state(fn (): array => [
            'type' => 'variable',
            'variant_options' => $variantOptions,
        ])->afterCreating(function (Product $product): void {
            $combinations = [[]];

            foreach ($product->variant_options ?? [] as $option) {
                $next = [];

                foreach ($combinations as $combo) {
                    foreach ($option['values'] as $val) {
                        $next[] = [...$combo, $option['name'] => $val];
                    }
                }

                $combinations = $next;
            }

            foreach ($combinations as $combo) {
                $sku = Str::upper('P-'.substr(
                    hash('sha256', $product->slug.'|'.json_encode($combo, JSON_THROW_ON_ERROR)),
                    0,
                    32,
                ));

                $product->variants()->create([
                    'sku' => $sku,
                    'name' => implode(' / ', array_values($combo)),
                    'attributes' => $combo,
                    'image' => null,
                ]);
            }
        });
    }

    public function onSale(float $salePrice, ?string $startAt = null, ?string $endAt = null): static
    {
        return $this->state(fn (): array => [
            'sale_price' => $salePrice,
            'sale_start_at' => $startAt,
            'sale_end_at' => $endAt,
        ]);
    }
}
