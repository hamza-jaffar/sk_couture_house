<?php

use Inertia\Testing\AssertableInertia as Assert;

it('shares frontend data including nav_links, footer_links, announcement, and cart_count', function () {
    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('frontend/welcome')
        ->has('nav_links')
        ->has('footer_links')
        ->has('announcement')
        ->has('cart_count')
        ->has('wishlist_count')
        ->where('announcement.enabled', true)
        ->where('cart_count', 0)
    );
});

it('includes customer_service and legal sections in footer_links', function () {
    $response = $this->get('/');

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->has('footer_links.customer_service.links')
        ->has('footer_links.about.links')
        ->has('footer_links.legal.links')
    );
});
