<?php

namespace Modules\Category\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\Category\Enum\OrderTypeEnum;
use Modules\Category\Models\Category;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $name = fake()->unique()->words(2, true);

        return [
            'parent_id' => null,
            'name' => $name,
            'slug' => Str::slug($name),
            'description' => fake()->optional()->paragraph(),
            'image_path' => null,
            'banner_path' => null,
            'is_active' => true,
            'is_featured' => false,
            'order_type' => OrderTypeEnum::DIRECT,
            'meta_title' => fake()->optional()->sentence(4),
            'meta_description' => fake()->optional()->sentence(),
            'meta_keywords' => fake()->optional()->words(4, true),
        ];
    }

    public function childOf(Category $parent): static
    {
        return $this->for($parent, 'parent');
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }

    public function featured(): static
    {
        return $this->state(fn (): array => ['is_featured' => true]);
    }
}
