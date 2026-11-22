<?php

namespace Modules\Banner\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Banner\Models\Banner;

/**
 * @extends Factory<Banner>
 */
class BannerFactory extends Factory
{
    protected $model = Banner::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(3),
            'subtitle' => fake()->sentence(2),
            'description' => fake()->paragraph(),
            'media_type' => 'image',
            'media_path' => null,
            'button_text' => 'Shop Now',
            'button_url' => '/collections',
            'secondary_button_text' => 'Explore All',
            'secondary_button_url' => '/collections',
            'text_position' => 'left',
            'text_color' => 'light',
            'sort_order' => fake()->numberBetween(0, 10),
            'is_active' => true,
        ];
    }
}
