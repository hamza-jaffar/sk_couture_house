<?php

use App\Models\Page;
use App\Models\User;

describe('page management', function () {
    beforeEach(function () {
        Page::query()->delete();
    });

    it('stores page content and renders it on the public frontend route', function () {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('pages.store'), [
            'privacy-policy' => [
                'name' => 'Privacy Policy',
                'title' => 'Privacy Policy',
                'slug' => 'privacy-policy',
                'html' => '<p>Updated privacy policy.</p>',
            ],
            'rules-and-regulation' => [
                'name' => 'Rules and Regulation',
                'title' => 'Rules and Regulation',
                'slug' => 'rules-and-regulation',
                'html' => '<p>Updated rules.</p>',
            ],
            'policies' => [
                'name' => 'Policies',
                'title' => 'Policies',
                'slug' => 'policies',
                'html' => '<p>Updated policies.</p>',
            ],
        ]);

        $response->assertRedirect(route('pages.index'));

        $this->assertDatabaseHas('pages', [
            'slug' => 'privacy-policy',
            'title' => 'Privacy Policy',
            'html' => '<p>Updated privacy policy.</p>',
        ]);

        $publicResponse = $this->get('/privacy-policy');

        $publicResponse->assertOk();
        $publicResponse->assertSee('Updated privacy policy.');
    });
});
