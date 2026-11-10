<?php

use Modules\Category\Models\Category;

it('creates categories with a unique slug and supported factory states', function () {
    $parent = Category::factory()->create([
        'name' => 'Clothing',
        'slug' => 'clothing',
    ]);

    $category = Category::factory()
        ->childOf($parent)
        ->inactive()
        ->featured()
        ->create([
            'name' => 'Summer Dresses',
            'slug' => 'summer-dresses',
        ]);

    expect($category->parent->is($parent))->toBeTrue()
        ->and($category->is_active)->toBeFalse()
        ->and($category->is_featured)->toBeTrue()
        ->and($category->image_path)->toBeNull()
        ->and($category->banner_path)->toBeNull();
});
