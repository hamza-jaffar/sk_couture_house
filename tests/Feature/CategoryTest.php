<?php

use App\Models\Category;
use App\Models\Collections;

it('associates collections with categories and featured collections', function () {
    $collection = Collections::create([
        'title' => 'Signature Drop',
        'desc' => 'A featured collection',
        'is_featured' => true,
    ]);

    $category = Category::create([
        'name' => 'Casual',
        'desc' => 'Relaxed pieces',
        'featured_collection_id' => $collection->id,
    ]);

    $collection->update(['category_id' => $category->id]);

    expect($category->collections)->toHaveCount(1)
        ->and($collection->category->is($category))->toBeTrue()
        ->and($category->featuredCollection->is($collection))->toBeTrue();
});
