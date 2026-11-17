<?php

namespace Modules\Product\Http\Controller;

use Inertia\Inertia;
use Inertia\Response;
use Modules\Product\Services\ProductService;
use Modules\Setting\Services\SiteSettingService;

class FrontendProductController
{
    public function __construct(
        protected ProductService $productService,
        protected SiteSettingService $settingService,
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
        ]);
    }
}
