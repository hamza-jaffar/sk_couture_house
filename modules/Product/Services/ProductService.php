<?php

namespace Modules\Product\Services;

use App\Helpers\FileHelper;
use App\Helpers\SlugHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Modules\Category\Enum\OrderTypeEnum;
use Modules\Category\Models\Category;
use Modules\Product\Models\Product;
use Modules\Setting\Services\SiteSettingService;

class ProductService
{
    public function __construct(
        private SiteSettingService $settings,
        private ProductListingCache $listingCache,
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginateProducts(array $filters): LengthAwarePaginator
    {
        return $this->listingCache->remember($filters, function () use ($filters): LengthAwarePaginator {
            $query = Product::query()
                ->with([
                    'category:id,name,slug,order_type',
                    'variants:id,product_id,sku,name,attributes,image',
                ])
                ->withCount('variants');

            $status = $filters['status'] ?? 'all';

            if ($status === 'deleted') {
                $query->onlyTrashed();
            } elseif ($status !== 'all') {
                $query->where('status', $status);
            }

            if (filled($filters['search'] ?? null)) {
                $search = trim($filters['search']);
                $query->where(function (Builder $products) use ($search): void {
                    $products
                        ->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            }

            if (filled($filters['category'] ?? null)) {
                $query->whereHas(
                    'category',
                    fn (Builder $categories) => $categories->where('slug', $filters['category']),
                );
            }

            if (($filters['type'] ?? 'all') !== 'all') {
                $query->where('type', $filters['type']);
            }

            $sort = $filters['sort'] ?? 'created_at';
            $direction = $filters['direction'] ?? 'desc';

            $paginator = $query
                ->orderBy($sort, $direction)
                ->orderBy('id', $direction)
                ->paginate((int) ($filters['per_page'] ?? 10))
                ->withQueryString();

            return $paginator->through(fn (Product $product): array => $this->presentProduct($product));
        });
    }

    /**
     * Paginate products for frontend collection/product browsing with cache-first lookup.
     *
     * @param  list<int>  $categoryIds
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginateFrontendProducts(array $categoryIds, array $filters): LengthAwarePaginator
    {
        $cachePayload = [
            'frontend_category_ids' => $categoryIds,
            'filters' => $filters,
        ];

        return $this->listingCache->remember($cachePayload, function () use ($categoryIds, $filters): LengthAwarePaginator {
            $query = Product::query()
                ->where('status', 'published')
                ->whereIn('category_id', $categoryIds)
                ->with(['category:id,name,slug,order_type']);

            // Availability filter
            if (($filters['availability'] ?? null) === 'in_stock') {
                $query->where('stock', '>', 0);
            } elseif (($filters['availability'] ?? null) === 'out_of_stock') {
                $query->where('stock', '<=', 0);
            }

            // Product type filter
            if (filled($filters['type'] ?? null) && $filters['type'] !== 'all') {
                $query->where('type', $filters['type']);
            }

            // Price range filter
            if (filled($filters['min_price'] ?? null)) {
                $query->where('price', '>=', (float) $filters['min_price']);
            }
            if (filled($filters['max_price'] ?? null)) {
                $query->where('price', '<=', (float) $filters['max_price']);
            }

            // Search filter
            if (filled($filters['search'] ?? null)) {
                $search = trim((string) $filters['search']);
                $query->where(function (Builder $b) use ($search): void {
                    $b->where('title', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sort = $filters['sort'] ?? 'best_sellers';
            match ($sort) {
                'price_asc' => $query->orderBy('price', 'asc')->orderBy('id', 'asc'),
                'price_desc' => $query->orderBy('price', 'desc')->orderBy('id', 'desc'),
                'newest' => $query->orderBy('created_at', 'desc')->orderBy('id', 'desc'),
                default => $query->orderBy('is_featured', 'desc')->orderBy('id', 'desc'),
            };

            $perPage = max(1, min(48, (int) ($filters['per_page'] ?? 12)));
            $paginator = $query->paginate($perPage)->withQueryString();

            return $paginator->through(fn (Product $product): array => [
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
                'brand' => $product->category?->name ?? 'House Collection',
                'category' => $product->category ? [
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                    'order_type' => $product->category->order_type instanceof OrderTypeEnum
                        ? $product->category->order_type->value
                        : (string) ($product->category->order_type ?? 'direct'),
                ] : null,
                'order_type' => $product->effective_order_type,
            ]);
        });
    }

    /**
     * Find an active published product for frontend display (cached first).
     *
     * @return array<string, mixed>|null
     */
    public function findFrontendProduct(string $slug): ?array
    {
        return $this->listingCache->rememberSingle($slug, function () use ($slug): ?array {
            $product = Product::query()
                ->where('slug', $slug)
                ->where('status', 'published')
                ->with([
                    'category' => fn ($q) => $q->select(['id', 'name', 'slug', 'parent_id', 'order_type'])
                        ->with(['parent:id,name,slug']),
                    'variants' => fn ($q) => $q->orderBy('id'),
                ])
                ->first();

            if (! $product) {
                return null;
            }

            $images = array_map(
                fn (string $path): string => FileHelper::url($path, 'public'),
                $product->images ?? [],
            );

            return [
                'id' => (int) $product->id,
                'title' => $product->title,
                'slug' => $product->slug,
                'short_description' => $product->short_description,
                'description' => $product->description,
                'product_specifications' => $product->product_specifications,
                'care_instructions' => $product->care_instructions,
                'price' => (float) $product->price,
                'sale_price' => $product->sale_price !== null ? (float) $product->sale_price : null,
                'sku' => $product->sku,
                'stock' => (int) $product->stock,
                'type' => $product->type,
                'images' => $images,
                'variant_options' => $product->variant_options ?? [],
                'variants' => $product->variants->map(fn ($v): array => [
                    'id' => (int) $v->id,
                    'sku' => $v->sku,
                    'price' => (float) $v->price,
                    'sale_price' => $v->sale_price !== null ? (float) $v->sale_price : null,
                    'stock' => (int) $v->stock,
                    'option_values' => $v->option_values,
                    'image_url' => $v->image_path ? FileHelper::url($v->image_path, 'public') : null,
                ])->all(),
                'category' => $product->category ? [
                    'id' => (int) $product->category->id,
                    'name' => $product->category->name,
                    'slug' => $product->category->slug,
                    'order_type' => $product->category->order_type instanceof OrderTypeEnum
                        ? $product->category->order_type->value
                        : (string) ($product->category->order_type ?? 'direct'),
                    'parent' => $product->category->parent ? [
                        'name' => $product->category->parent->name,
                        'slug' => $product->category->parent->slug,
                    ] : null,
                ] : null,
                'order_type' => $product->effective_order_type,
            ];
        });
    }

    /**
     * Get recommended products for the frontend product detail page (cached first).
     *
     * @return list<array<string, mixed>>
     */
    public function getRecommendedProducts(int $currentProductId, ?int $categoryId, int $limit = 8): array
    {
        return $this->listingCache->rememberRecommendations($currentProductId, function () use ($currentProductId, $categoryId, $limit): array {
            $query = Product::query()
                ->where('status', 'published')
                ->where('id', '!=', $currentProductId)
                ->with(['category:id,name,slug']);

            if ($categoryId) {
                $query->orderByRaw('CASE WHEN category_id = ? THEN 0 ELSE 1 END', [$categoryId]);
            }

            $query->orderBy('is_featured', 'desc')->orderBy('created_at', 'desc');

            return $query->limit($limit)->get()->map(fn (Product $p): array => [
                'id' => (int) $p->id,
                'title' => $p->title,
                'slug' => $p->slug,
                'price' => (float) $p->price,
                'sale_price' => $p->sale_price !== null ? (float) $p->sale_price : null,
                'brand' => $p->category?->name ?? 'House Collection',
                'images' => array_map(
                    fn (string $path): string => FileHelper::url($path, 'public'),
                    $p->images ?? [],
                ),
                'category' => $p->category ? [
                    'name' => $p->category->name,
                    'slug' => $p->category->slug,
                ] : null,
            ])->all();
        });
    }

    /**
     * @return array{
     *     categories: list<array{id: int, name: string, slug: string, order_type: string}>,
     *     variant_presets: list<array{id: string, name: string, values: list<string>}>,
     *     currency: string,
     *     currency_icon: string
     * }
     */
    public function formOptions(): array
    {
        return $this->listingCache->rememberFormOptions(function (): array {
            $settings = $this->settings->all();

            return [
                'categories' => Category::query()
                    ->where('is_active', true)
                    ->orderBy('name')
                    ->orderBy('id')
                    ->get(['id', 'name', 'slug', 'order_type'])
                    ->map(fn (Category $category): array => [
                        'id' => (int) $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
                        'order_type' => $category->order_type instanceof OrderTypeEnum
                            ? $category->order_type->value
                            : (string) ($category->order_type ?? OrderTypeEnum::DIRECT->value),
                    ])
                    ->all(),
                'variant_presets' => array_values(array_map(
                    fn (array $variant): array => [
                        'id' => (string) $variant['id'],
                        'name' => (string) $variant['name'],
                        'values' => array_values($variant['values']),
                    ],
                    $settings['variants'],
                )),
                'currency' => $settings['general']['currency'],
                'currency_icon' => $settings['general']['currency_icon'],
            ];
        });
    }

    /**
     * @return array<string, mixed>
     */
    public function productForForm(Product $product): array
    {
        $product->load([
            'category:id,name,slug,order_type',
            'variants',
        ])->loadCount('variants');

        return $this->presentProduct($product);
    }

    /**
     * @return array<string, mixed>
     */
    public function productForDetail(Product $product): array
    {
        $product->load([
            'category:id,name,slug,order_type',
            'variants:id,product_id,sku,name,attributes,image',
        ])->loadCount('variants');

        return $this->presentProduct($product);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createProduct(array $data): Product
    {
        $this->listingCache->invalidateAfterCommit();

        return DB::transaction(function () use ($data): Product {
            $product = Product::query()->create([
                ...Arr::only($data, $this->productFields()),
                'slug' => SlugHelper::fromInput(
                    $data['slug'] ?? null,
                    $data['title'],
                    (new Product)->getTable(),
                ),
            ]);

            $this->syncVariants($product, $data['variants'] ?? []);

            return $product->load(['category:id,name,slug,order_type', 'variants']);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateProduct(Product $product, array $data): Product
    {
        $this->listingCache->invalidateAfterCommit();

        return DB::transaction(function () use ($product, $data): Product {
            $product = Product::query()
                ->whereKey($product->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $product->update([
                ...Arr::only($data, $this->productFields()),
                'slug' => SlugHelper::fromInput(
                    $data['slug'] ?? null,
                    $data['title'],
                    (new Product)->getTable(),
                    ignoreId: (int) $product->getKey(),
                ),
            ]);

            $this->syncVariants($product, $data['variants'] ?? []);

            return $product->load(['category:id,name,slug,order_type', 'variants']);
        });
    }

    public function deleteProduct(Product $product): void
    {
        $this->listingCache->invalidateAfterCommit();

        DB::transaction(function () use ($product): void {
            Product::query()
                ->whereKey($product->getKey())
                ->lockForUpdate()
                ->firstOrFail()
                ->delete();
        });
    }

    /**
     * @param  list<int>  $ids
     */
    public function deleteProducts(array $ids): void
    {
        $this->listingCache->invalidateAfterCommit();

        DB::transaction(function () use ($ids): void {
            $products = Product::query()
                ->whereKey($ids)
                ->lockForUpdate()
                ->get();

            $this->assertAllFound($products->count(), $ids);

            foreach ($products as $product) {
                $product->delete();
            }
        });
    }

    public function restoreProduct(Product $product): void
    {
        $this->listingCache->invalidateAfterCommit();

        DB::transaction(function () use ($product): void {
            Product::withTrashed()
                ->whereKey($product->getKey())
                ->whereNotNull('deleted_at')
                ->lockForUpdate()
                ->firstOrFail()
                ->restore();
        });
    }

    /**
     * @param  list<int>  $ids
     */
    public function restoreProducts(array $ids): void
    {
        $this->listingCache->invalidateAfterCommit();

        DB::transaction(function () use ($ids): void {
            $products = Product::withTrashed()
                ->whereKey($ids)
                ->whereNotNull('deleted_at')
                ->lockForUpdate()
                ->get();

            $this->assertAllFound($products->count(), $ids);

            foreach ($products as $product) {
                $product->restore();
            }
        });
    }

    public function forceDeleteProduct(Product $product): void
    {
        $this->listingCache->invalidateAfterCommit();

        DB::transaction(function () use ($product): void {
            Product::withTrashed()
                ->whereKey($product->getKey())
                ->whereNotNull('deleted_at')
                ->lockForUpdate()
                ->firstOrFail()
                ->forceDelete();
        });
    }

    /**
     * @param  list<int>  $ids
     */
    public function forceDeleteProducts(array $ids): void
    {
        $this->listingCache->invalidateAfterCommit();

        DB::transaction(function () use ($ids): void {
            $products = Product::withTrashed()
                ->whereKey($ids)
                ->lockForUpdate()
                ->get();

            $this->assertAllFound($products->count(), $ids);

            foreach ($products as $product) {
                $product->forceDelete();
            }
        });
    }

    /**
     * @param  list<int>  $ids
     */
    private function assertAllFound(int $found, array $ids): void
    {
        if ($found !== count(array_unique($ids))) {
            throw ValidationException::withMessages([
                'ids' => __('One or more selected products are no longer available. Refresh and try again.'),
            ]);
        }
    }

    /**
     * @return list<string>
     */
    private function productFields(): array
    {
        return [
            'title',
            'short_description',
            'description',
            'product_specifications',
            'care_instructions',
            'price',
            'sale_price',
            'sale_start_at',
            'sale_end_at',
            'sku',
            'stock',
            'type',
            'status',
            'is_featured',
            'category_id',
            'images',
            'variant_options',
            'meta_title',
            'meta_description',
            'meta_keywords',
            'canonical_url',
            'og_title',
            'og_description',
            'og_image',
            'robots_meta',
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $variants
     */
    private function syncVariants(Product $product, array $variants): void
    {
        $product->variants()->delete();

        if ($product->type !== 'variable') {
            return;
        }

        $options = $product->variant_options ?? [];
        $expectedCombinations = $this->variantCombinations($options);
        $submittedCombinations = array_map(
            fn (array $variant): array => $variant['attributes'] ?? [],
            $variants,
        );

        $normalize = static function (array $attributes): string {
            ksort($attributes);

            return json_encode($attributes, JSON_THROW_ON_ERROR);
        };
        $expected = array_map($normalize, $expectedCombinations);
        $submitted = array_map($normalize, $submittedCombinations);
        sort($expected);
        sort($submitted);

        if ($expected !== $submitted) {
            throw ValidationException::withMessages([
                'variants' => __('Variant inventory must match every option combination.'),
            ]);
        }

        foreach ($variants as $variant) {
            $attributes = $variant['attributes'];
            $sku = Str::upper('P-'.substr(
                hash('sha256', $product->slug.'|'.json_encode($attributes, JSON_THROW_ON_ERROR)),
                0,
                32,
            ));

            $product->variants()->create([
                'sku' => $sku,
                'name' => implode(' / ', array_values($attributes)),
                'attributes' => $attributes,
                'image' => null,
            ]);
        }
    }

    /**
     * @param  list<array{name: string, values: list<string>}>  $options
     * @return list<array<string, string>>
     */
    private function variantCombinations(array $options): array
    {
        $combinations = [[]];

        foreach ($options as $option) {
            $nextCombinations = [];

            foreach ($combinations as $combination) {
                foreach ($option['values'] as $value) {
                    $nextCombinations[] = [
                        ...$combination,
                        $option['name'] => $value,
                    ];
                }
            }

            $combinations = $nextCombinations;
        }

        return $combinations;
    }

    /**
     * @return array<string, mixed>
     */
    private function presentProduct(Product $product): array
    {
        $images = array_map(
            fn (string $path): array => [
                'path' => $path,
                'url' => FileHelper::url($path, 'public'),
            ],
            $product->images ?? [],
        );

        return [
            ...$product->toArray(),
            'images' => $images,
            'og_image_url' => FileHelper::url($product->og_image, 'public'),
        ];
    }
}
