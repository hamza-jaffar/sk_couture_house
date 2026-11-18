<?php

namespace Modules\Page\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Page\Models\Page;

class FrontendPageController
{
    /**
     * Show a published page by slug.
     */
    public function show(Request $request, string $slug): Response
    {
        $page = Page::query()
            ->where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('frontend/page/show', [
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'slug' => $page->slug,
                'content' => $page->content,
                'meta_title' => $page->meta_title ?? $page->title,
                'meta_description' => $page->meta_description,
                'meta_keywords' => $page->meta_keywords,
                'canonical_url' => $page->canonical_url,
                'og_image' => $page->og_image,
                'updated_at' => $page->updated_at?->toISOString(),
            ],
        ]);
    }
}
