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
                    'category:id,name,slug',
                    'variants:id,product_id,sku,name,price,sale_price,stock,attributes,image',
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
     * @return array{
     *     categories: list<array{id: int, name: string, slug: string}>,
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
                    ->get(['id', 'name', 'slug'])
                    ->map(fn (Category $category): array => [
                        'id' => (int) $category->id,
                        'name' => $category->name,
                        'slug' => $category->slug,
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
            'category:id,name,slug',
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
            'category:id,name,slug',
            'variants:id,product_id,sku,name,price,sale_price,stock,attributes,image',
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

            return $product->load(['category:id,name,slug', 'variants']);
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

            return $product->load(['category:id,name,slug', 'variants']);
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
     * @return list<string>
     */
    private function productFields(): array
    {
        return [
            'title',
            'short_description',
            'description',
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
            $product->update(['stock' => (int) $product->stock]);

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

        $totalStock = 0;

        foreach ($variants as $variant) {
            $attributes = $variant['attributes'];
            $totalStock += (int) $variant['stock'];
            $sku = Str::upper('P-'.substr(
                hash('sha256', $product->slug.'|'.json_encode($attributes, JSON_THROW_ON_ERROR)),
                0,
                32,
            ));

            $product->variants()->create([
                'sku' => $sku,
                'name' => implode(' / ', array_values($attributes)),
                'price' => filled($variant['price'] ?? null) ? $variant['price'] : null,
                'sale_price' => filled($variant['sale_price'] ?? null)
                    ? $variant['sale_price']
                    : null,
                'stock' => (int) $variant['stock'],
                'attributes' => $attributes,
                'image' => null,
            ]);
        }

        $product->update(['stock' => $totalStock]);
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
