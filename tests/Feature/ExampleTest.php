<?php

use Inertia\Testing\AssertableInertia as Assert;

test('returns a successful response with home page props and deferred groups', function () {
    $response = $this->get(route('home'));

    $response->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('frontend/welcome')
            ->missing('banners')
            ->missing('featuredProducts')
            ->loadDeferredProps(['home-banners', 'home-featured', 'home-collections', 'home-new-arrivals'], fn (Assert $page) => $page
                ->has('banners')
                ->has('featuredProducts')
                ->has('collections')
                ->has('newArrivals')
            )
        );
});
