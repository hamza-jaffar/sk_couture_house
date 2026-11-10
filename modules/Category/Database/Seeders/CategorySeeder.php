<?php

namespace Modules\Category\Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Modules\Category\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $clothing = $this->firstOrCreateCategory(
            'Clothing',
            null,
            'Apparel and clothing collections.',
            true,
        );
        $this->firstOrCreateCategory(
            'Dresses',
            $clothing,
            'Dresses for everyday wear and special occasions.',
        );
        $this->firstOrCreateCategory(
            'Tops',
            $clothing,
            'Shirts, blouses, and other tops.',
        );
        $this->firstOrCreateCategory(
            'Outerwear',
            $clothing,
            'Coats and jackets for every season.',
        );

        $accessories = $this->firstOrCreateCategory(
            'Accessories',
            null,
            'Finishing touches for every outfit.',
            true,
        );
        $this->firstOrCreateCategory(
            'Bags',
            $accessories,
            'Bags for everyday use and special occasions.',
        );
    }

    private function firstOrCreateCategory(
        string $name,
        ?Category $parent,
        string $description,
        bool $featured = false,
    ): Category {
        $slug = Str::slug($name);

        return Category::query()->firstOrCreate(
            ['slug' => $slug],
            [
                'parent_id' => $parent?->getKey(),
                'name' => $name,
                'description' => $description,
                'is_active' => true,
                'is_featured' => $featured,
            ],
        );
    }
}
