<?php

namespace App\Http\Controllers;

use App\Helpers\FileHelper;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Banner\Services\BannerService;
use Modules\Category\Services\CategoryService;
use Modules\Product\Models\Product;
use Modules\Product\Services\ProductListingCache;

class HomeController extends Controller
{
    public function __construct(
        private readonly BannerService $bannerService,
        private readonly CategoryService $categoryService,
        private readonly ProductListingCache $productCache,
    ) {}

    /**
     * Render the storefront home page with deferred banners, featured products, collections, and new arrivals.
     */
    public function index(): Response
    {
        return Inertia::render('frontend/welcome', [
            'banners' => Inertia::defer(
                fn () => $this->bannerService->getActiveBanners(),
                'home-banners',
            ),
            'featuredProducts' => Inertia::defer(
                fn () => $this->productCache->rememberFeatured(
                    fn (): array => $this->getProducts(featuredOnly: true, limit: 8)
                ),
                'home-featured',
            ),
            'collections' => Inertia::defer(
                fn () => $this->categoryService->getActiveCollections(),
                'home-collections',
            ),
            'newArrivals' => Inertia::defer(
                fn () => $this->productCache->rememberNewArrivals(
                    fn (): array => $this->getProducts(featuredOnly: false, limit: 4)
                ),
                'home-new-arrivals',
            ),
        ]);
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function getProducts(bool $featuredOnly = false, int $limit = 8): array
    {
        $query = Product::query()
            ->where('status', 'published')
            ->where('stock', '>', 0)
            ->with(['category:id,name,slug,order_type'])
            ->orderBy('created_at', 'desc')
            ->limit($limit);

        if ($featuredOnly) {
            $query->where('is_featured', true);
        }

        return $query->get()
            ->map(fn (Product $product): array => [
                'id' => (int) $product->id,
                'title' => $product->title,
                'slug' => $product->slug,
                'price' => (float) $product->price,
                'sale_price' => $product->sale_price !== null ? (float) $product->sale_price : null,
                'stock' => (int) $product->stock,
                'type' => $product->type,
                'is_featured' => (bool) $product->is_featured,
                'images' => array_map(
                    fn (string $path): string => FileHelper::url($path, 'public'),
                    $product->images ?? [],
                ),
                'category' => $product->category ? [
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                    'order_type' => is_string($product->category->order_type)
                        ? $product->category->order_type
                        : $product->category->order_type?->value ?? 'direct',
                ] : null,
                'order_type' => $product->effective_order_type,
            ])
            ->all();
    }
}
