<?php

namespace Modules\Category\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Category\Services\CategoryService;
use Modules\Product\Services\ProductService;

class FrontendController
{
    public function __construct(
        protected CategoryService $categoryService,
        protected ProductService $productService,
    ) {}

    public function index(): Response
    {
        return Inertia::render('frontend/collections/index', [
            'collections' => Inertia::defer(fn () => $this->categoryService->getActiveCollections(), 'collections'),
        ]);
    }

    public function single(string $slug, Request $request): Response
    {
        $collection = $this->categoryService->findActiveBySlug($slug);

        if (! $collection) {
            abort(404);
        }

        $filters = $request->only(['sort', 'availability', 'type', 'min_price', 'max_price', 'search']);

        return Inertia::render('frontend/collections/show', [
            'collection' => $collection,
            'filters' => $filters,
            'products' => Inertia::scroll(
                fn () => $this->productService->paginateFrontendProducts($collection['category_ids'], $filters)
            )->defer('products'),
        ]);
    }
}
