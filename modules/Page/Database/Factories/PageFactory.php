<?php

namespace Modules\Page\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Modules\Page\Models\Page;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    protected $model = Page::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(3);

        return [
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(100, 999),
            'content' => '<p>'.implode('</p><p>', fake()->paragraphs(3)).'</p>',
            'is_system' => false,
            'is_active' => true,
            'meta_title' => $title.' | SK Couture House',
            'meta_description' => fake()->sentence(10),
            'meta_keywords' => 'couture, fashion, bespoke, luxury',
            'canonical_url' => null,
            'og_image' => null,
        ];
    }

    /**
     * Indicate that the page is a system page.
     */
    public function system(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_system' => true,
        ]);
    }
}
