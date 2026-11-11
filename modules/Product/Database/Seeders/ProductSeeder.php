<?php

namespace Modules\Product\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\Category\Models\Category;
use Modules\Product\Models\Product;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $dresses = Category::query()->where('slug', 'dresses')->first();
        $tops = Category::query()->where('slug', 'tops')->first();
        $outerwear = Category::query()->where('slug', 'outerwear')->first();
        $bags = Category::query()->where('slug', 'bags')->first();

        // Variable: Silk Evening Gown
        Product::factory()
            ->when($dresses, fn ($f) => $f->forCategory($dresses))
            ->variable([
                ['name' => 'Size', 'values' => ['XS', 'S', 'M', 'L']],
                ['name' => 'Color', 'values' => ['Emerald', 'Midnight Blue', 'Champagne']],
            ])
            ->create([
                'title' => 'Silk Evening Gown',
                'slug' => 'silk-evening-gown',
                'short_description' => 'A flowing silk gown tailored with minimalist elegance.',
                'price' => 280.00,
                'sale_price' => 240.00,
                'stock' => 25,
                'is_featured' => true,
                'status' => 'published',
            ]);

        // Variable: Linen Casual Shirt
        Product::factory()
            ->when($tops, fn ($f) => $f->forCategory($tops))
            ->variable([
                ['name' => 'Size', 'values' => ['S', 'M', 'L', 'XL']],
            ])
            ->create([
                'title' => 'Linen Casual Shirt',
                'slug' => 'linen-casual-shirt',
                'short_description' => 'Breathable pure linen shirt for relaxed styling.',
                'price' => 65.00,
                'stock' => 40,
                'is_featured' => true,
                'status' => 'published',
            ]);

        // Variable: Wool Trench Coat
        Product::factory()
            ->when($outerwear, fn ($f) => $f->forCategory($outerwear))
            ->variable([
                ['name' => 'Size', 'values' => ['S', 'M', 'L']],
            ])
            ->create([
                'title' => 'Wool Trench Coat',
                'slug' => 'wool-trench-coat',
                'short_description' => 'Classic double-breasted trench coat in virgin wool.',
                'price' => 320.00,
                'stock' => 15,
                'is_featured' => false,
                'status' => 'published',
            ]);

        // Simple: Handcrafted Leather Tote
        Product::factory()
            ->when($bags, fn ($f) => $f->forCategory($bags))
            ->simple()
            ->create([
                'title' => 'Handcrafted Leather Tote',
                'slug' => 'handcrafted-leather-tote',
                'short_description' => 'Structured tote bag in full-grain vegetable-tanned leather.',
                'price' => 175.00,
                'stock' => 18,
                'is_featured' => true,
                'status' => 'published',
            ]);
    }
}
