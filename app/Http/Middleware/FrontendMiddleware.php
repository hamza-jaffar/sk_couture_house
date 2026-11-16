<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Modules\Category\Models\Category;
use Modules\Setting\Services\SiteSettingService;
use Symfony\Component\HttpFoundation\Response;

class FrontendMiddleware
{
    public function __construct(
        protected SiteSettingService $settings,
    ) {}

    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Inertia::share([
            'nav_links' => fn () => $this->getNavLinks(),
            'footer_links' => fn () => $this->getFooterLinks(),
            'announcement' => fn () => $this->getAnnouncement(),
            'cart_count' => fn () => $this->getCartCount($request),
            'wishlist_count' => fn () => $this->getWishlistCount($request),
        ]);

        return $next($request);
    }

    /**
     * Build the multi-level navigation links.
     * Combines dynamic active categories from the database with curated editorial links.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function getNavLinks(): array
    {
        $categoryNav = $this->getCategoriesTree();

        if (! empty($categoryNav)) {
            return [
                [
                    'label' => 'New Arrivals',
                    'href' => '#',
                    'children' => [
                        ['label' => 'All New In', 'href' => '#'],
                        ['label' => 'Latest Drop', 'href' => '#'],
                        ['label' => 'Trending This Season', 'href' => '#'],
                        ['label' => 'Capsule Edit', 'href' => '#'],
                    ],
                ],
                [
                    'label' => 'Best Sellers',
                    'href' => '#',
                    'children' => [
                        ['label' => 'All Best Sellers', 'href' => '#'],
                        ['label' => 'Most Coveted', 'href' => '#'],
                        ['label' => 'Iconic Pieces', 'href' => '#'],
                        ['label' => 'Curated Favorites', 'href' => '#'],
                    ],
                ],
                ...$categoryNav,
                [
                    'label' => 'Brands',
                    'href' => '#',
                    'children' => [
                        ['label' => 'All Designers', 'href' => '#'],
                        [
                            'label' => 'Haute Couture',
                            'children' => [
                                ['label' => 'Atelier SK', 'href' => '#'],
                                ['label' => 'Maison Noir', 'href' => '#'],
                                ['label' => 'L’Étoile Paris', 'href' => '#'],
                            ],
                        ],
                        [
                            'label' => 'Contemporary',
                            'children' => [
                                ['label' => 'Studio Minimal', 'href' => '#'],
                                ['label' => 'Linen & Silk', 'href' => '#'],
                            ],
                        ],
                        ['label' => 'Artisanal & Sustainable', 'href' => '#'],
                    ],
                ],
                [
                    'label' => 'Fragrances',
                    'href' => '#',
                    'children' => [
                        ['label' => 'Discovery Collection', 'href' => '#'],
                        [
                            'label' => 'Eau de Parfum',
                            'children' => [
                                ['label' => 'Oud Mystique', 'href' => '#'],
                                ['label' => 'Velvet Rose', 'href' => '#'],
                                ['label' => 'Smoky Amber', 'href' => '#'],
                            ],
                        ],
                        ['label' => 'Home Scents & Candles', 'href' => '#'],
                        ['label' => 'Bespoke Gift Sets', 'href' => '#'],
                    ],
                ],
            ];
        }

        return $this->getDefaultNavLinks();
    }

    /**
     * Recursively fetch active categories as a nested tree.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function getCategoriesTree(): array
    {
        try {
            $categories = Category::query()
                ->whereNull('parent_id')
                ->where('is_active', true)
                ->with([
                    'children' => fn ($q) => $q->where('is_active', true)->with([
                        'children' => fn ($sub) => $sub->where('is_active', true),
                    ]),
                ])
                ->orderBy('name')
                ->get();

            return $categories->map(fn (Category $cat) => $this->formatCategoryNode($cat))->all();
        } catch (\Throwable) {
            return [];
        }
    }

    /**
     * Format a category node recursively for multi-level navigation.
     *
     * @return array<string, mixed>
     */
    protected function formatCategoryNode(Category $category): array
    {
        $node = [
            'label' => $category->name,
            'href' => '#',
        ];

        if ($category->relationLoaded('children') && $category->children->isNotEmpty()) {
            $children = [
                ['label' => 'All '.$category->name, 'href' => '#'],
                ...$category->children->map(fn (Category $child) => $this->formatCategoryNode($child))->all(),
            ];
            $node['children'] = $children;
        }

        return $node;
    }

    /**
     * Default curated luxury navigation when DB categories are empty.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function getDefaultNavLinks(): array
    {
        return [
            [
                'label' => 'New Arrivals',
                'children' => [
                    ['label' => 'All New In', 'href' => '#'],
                    [
                        'label' => 'Apparel',
                        'children' => [
                            ['label' => 'Dresses & Gowns', 'href' => '#'],
                            ['label' => 'Tops & Blouses', 'href' => '#'],
                            ['label' => 'Tailored Trousers', 'href' => '#'],
                        ],
                    ],
                    [
                        'label' => 'Accessories',
                        'children' => [
                            ['label' => 'Leather Bags', 'href' => '#'],
                            ['label' => 'Fine Jewelry', 'href' => '#'],
                            ['label' => 'Silk Scarves', 'href' => '#'],
                        ],
                    ],
                    ['label' => 'Footwear', 'href' => '#'],
                ],
            ],
            [
                'label' => 'Best Sellers',
                'children' => [
                    ['label' => 'All Best Sellers', 'href' => '#'],
                    ['label' => 'Most Coveted', 'href' => '#'],
                    ['label' => 'Iconic Pieces', 'href' => '#'],
                ],
            ],
            [
                'label' => 'Brands',
                'children' => [
                    ['label' => 'All Designers', 'href' => '#'],
                    [
                        'label' => 'Haute Couture',
                        'children' => [
                            ['label' => 'Atelier SK', 'href' => '#'],
                            ['label' => 'Maison Noir', 'href' => '#'],
                        ],
                    ],
                ],
            ],
            [
                'label' => "Women's Clothing",
                'children' => [
                    ['label' => 'Explore All', 'href' => '#'],
                    ['label' => 'Dresses', 'href' => '#'],
                    ['label' => 'Tops', 'href' => '#'],
                    ['label' => 'Bottoms', 'href' => '#'],
                ],
            ],
            [
                'label' => 'Essentials',
                'children' => [
                    ['label' => 'All Essentials', 'href' => '#'],
                    ['label' => 'Premium Basics', 'href' => '#'],
                    ['label' => 'Raw Denim', 'href' => '#'],
                ],
            ],
            [
                'label' => 'Fragrances',
                'children' => [
                    ['label' => 'Discovery Collection', 'href' => '#'],
                    ['label' => 'Eau de Parfum', 'href' => '#'],
                    ['label' => 'Home Scents', 'href' => '#'],
                ],
            ],
        ];
    }

    /**
     * Structured footer links for storefront.
     *
     * @return array<string, array<string, mixed>>
     */
    protected function getFooterLinks(): array
    {
        return [
            'customer_service' => [
                'title' => 'Client Care',
                'links' => [
                    ['label' => 'Contact Concierge', 'href' => '#contact'],
                    ['label' => 'Track Your Order', 'href' => '#track'],
                    ['label' => 'Shipping & Delivery', 'href' => '#shipping'],
                    ['label' => 'Returns & Exchanges', 'href' => '#returns'],
                    ['label' => 'Frequently Asked Questions', 'href' => '#faq'],
                ],
            ],
            'about' => [
                'title' => 'The House',
                'links' => [
                    ['label' => 'Our Heritage', 'href' => '#heritage'],
                    ['label' => 'Ateliers & Boutiques', 'href' => '#stores'],
                    ['label' => 'Sustainable Craftsmanship', 'href' => '#sustainability'],
                    ['label' => 'Press & Editorial', 'href' => '#press'],
                    ['label' => 'Careers', 'href' => '#careers'],
                ],
            ],
            'legal' => [
                'title' => 'Legal & Privacy',
                'links' => [
                    ['label' => 'Privacy Policy', 'href' => '#privacy'],
                    ['label' => 'Terms of Service', 'href' => '#terms'],
                    ['label' => 'Cookie Settings', 'href' => '#cookies'],
                    ['label' => 'Accessibility Statement', 'href' => '#accessibility'],
                ],
            ],
        ];
    }

    /**
     * Top banner announcement configuration.
     *
     * @return array<string, mixed>
     */
    protected function getAnnouncement(): array
    {
        return [
            'enabled' => true,
            'text' => 'Complimentary Worldwide Shipping On Orders Over $200',
            'link_text' => 'Track Order',
            'link_url' => '#track',
        ];
    }

    /**
     * Dynamic cart count.
     */
    protected function getCartCount(Request $request): int
    {
        return (int) $request->session()->get('cart_count', 0);
    }

    /**
     * Dynamic wishlist count.
     */
    protected function getWishlistCount(Request $request): int
    {
        return (int) $request->session()->get('wishlist_count', 0);
    }
}
