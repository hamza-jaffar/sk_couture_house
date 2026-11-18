<?php

namespace Modules\Product\Http\Controller;

use Inertia\Inertia;
use Inertia\Response;
use Modules\Product\Services\ProductService;
use Modules\Review\Services\ReviewService;
use Modules\Setting\Services\SiteSettingService;

class FrontendProductController
{
    public function __construct(
        protected ProductService $productService,
        protected SiteSettingService $settingService,
        protected ReviewService $reviewService,
    ) {}

    public function show(string $slug): Response
    {
        $product = $this->productService->findFrontendProduct($slug);

        if (! $product) {
            abort(404);
        }

        $settings = $this->settingService->all();
        $shippingAndReturn = $settings['general']['shipping_and_return'] ?? '';

        $recommended = $this->productService->getRecommendedProducts(
            $product['id'],
            $product['category']['id'] ?? null,
        );

        return Inertia::render('frontend/products/show', [
            'product' => $product,
            'recommended' => $recommended,
            'shipping_and_return' => $shippingAndReturn,
            'reviews_data' => Inertia::defer(
                fn () => $this->reviewService->getProductReviewsSummary($product['id']),
                'product-reviews',
            ),
        ]);
    }
}
