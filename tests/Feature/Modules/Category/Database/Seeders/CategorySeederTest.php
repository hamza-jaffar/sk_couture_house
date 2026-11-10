<?php

use Modules\Category\Database\Seeders\CategorySeeder;
use Modules\Category\Models\Category;

it('seeds the category hierarchy idempotently', function () {
    $this->seed(CategorySeeder::class);
    $this->seed(CategorySeeder::class);

    $clothing = Category::query()->where('slug', 'clothing')->firstOrFail();
    $accessories = Category::query()->where('slug', 'accessories')->firstOrFail();

    expect(Category::query()->count())->toBe(6)
        ->and($clothing->children()->pluck('slug')->all())
        ->toEqualCanonicalizing(['dresses', 'tops', 'outerwear'])
        ->and($accessories->children()->pluck('slug')->all())
        ->toBe(['bags']);
});
