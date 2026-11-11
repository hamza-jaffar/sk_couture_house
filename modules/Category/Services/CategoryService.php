<?php

namespace Modules\Category\Services;

use App\Helpers\SlugHelper;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Modules\Category\Models\Category;

class CategoryService
{
    public function __construct(private CategoryListingCache $listingCache) {}

    /**
     * @param  array{
     *     search?: string|null,
     *     parent?: string|null,
     *     status?: 'active'|'deleted',
     *     sort?: 'name'|'is_active'|'is_featured'|'children_count'|'created_at',
     *     direction?: 'asc'|'desc',
     *     per_page?: int|string,
     *     page?: int|string
     * }  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginateCategories(array $filters): LengthAwarePaginator
    {
        return $this->listingCache->remember(
            $filters,
            fn (): LengthAwarePaginator => $this->paginateCategoriesWithoutCache($filters),
        );
    }

    /**
     * @return list<array{id: int, parent_id: int|null, name: string, slug: string, deleted_at: string|null}>
     */
    public function parentOptions(): array
    {
        return $this->listingCache->rememberParentOptions(
            fn (): array => Category::withTrashed()
                ->orderBy('name')
                ->orderBy('id')
                ->get(['id', 'parent_id', 'name', 'slug', 'deleted_at'])
                ->map(fn (Category $category): array => [
                    'id' => (int) $category->id,
                    'parent_id' => $category->parent_id === null ? null : (int) $category->parent_id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'deleted_at' => $category->deleted_at?->toISOString(),
                ])
                ->all(),
        );
    }

    /**
     * @param  array{
     *     parent_id: int|null,
     *     name: string,
     *     description: string|null,
     *     image_path: string|null,
     *     banner_path: string|null,
     *     is_active: bool,
     *     is_featured: bool,
     *     meta_title: string|null,
     *     meta_description: string|null,
     *     meta_keywords: string|null,
     *     order_type?: string
     * }  $data
     */
    public function createCategory(array $data): Category
    {
        return DB::transaction(function () use ($data): Category {
            $this->validateParent($data['parent_id']);

            $category = Category::query()->create([
                ...$data,
                'slug' => SlugHelper::unique(
                    $data['name'],
                    (new Category)->getTable(),
                    fallback: 'category',
                ),
            ]);

            $this->listingCache->invalidateAfterCommit();

            return $category;
        });
    }

    /**
     * @param  array{
     *     parent_id: int|null,
     *     name: string,
     *     description: string|null,
     *     image_path: string|null,
     *     banner_path: string|null,
     *     is_active: bool,
     *     is_featured: bool,
     *     meta_title: string|null,
     *     meta_description: string|null,
     *     meta_keywords: string|null,
     *     order_type?: string
     * }  $data
     */
    public function updateCategory(Category $category, array $data): Category
    {
        return DB::transaction(function () use ($category, $data): Category {
            $category = Category::query()
                ->whereKey($category->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $this->validateParent($data['parent_id'], $category);

            $category->update([
                ...$data,
                'slug' => SlugHelper::unique(
                    $data['name'],
                    (new Category)->getTable(),
                    ignoreId: (int) $category->getKey(),
                    fallback: 'category',
                ),
            ]);

            $this->listingCache->invalidateAfterCommit();

            return $category;
        });
    }

    public function deleteCategory(Category $category): void
    {
        $this->deleteCategories([$category->getKey()]);
    }

    /**
     * @param  list<int>  $ids
     */
    public function deleteCategories(array $ids): void
    {
        DB::transaction(function () use ($ids): void {
            $categories = Category::query()
                ->whereKey($ids)
                ->lockForUpdate()
                ->get();

            $this->assertAllFound($categories->count(), $ids);
            $this->assertNoUnselectedChildren($ids, includeTrashed: false);

            foreach ($this->sortByDepth($categories, parentsFirst: false) as $category) {
                $category->delete();
            }

            $this->listingCache->invalidateAfterCommit();
        });
    }

    public function restoreCategory(Category $category): void
    {
        $this->restoreCategories([$category->getKey()]);
    }

    /**
     * @param  list<int>  $ids
     */
    public function restoreCategories(array $ids): void
    {
        DB::transaction(function () use ($ids): void {
            $categories = Category::withTrashed()
                ->whereKey($ids)
                ->whereNotNull('deleted_at')
                ->lockForUpdate()
                ->get();

            $this->assertAllFound($categories->count(), $ids);

            $selectedIds = array_fill_keys($ids, true);

            foreach ($categories as $category) {
                if ($category->parent_id === null || isset($selectedIds[$category->parent_id])) {
                    continue;
                }

                $parentIsActive = Category::query()
                    ->whereKey($category->parent_id)
                    ->exists();

                if (! $parentIsActive) {
                    throw ValidationException::withMessages([
                        'ids' => __('Restore the parent category before restoring its children.'),
                    ]);
                }
            }

            foreach ($this->sortByDepth($categories, parentsFirst: true) as $category) {
                $category->restore();
            }

            $this->listingCache->invalidateAfterCommit();
        });
    }

    public function forceDeleteCategory(Category $category): void
    {
        $this->forceDeleteCategories([$category->getKey()]);
    }

    /**
     * @param  list<int>  $ids
     */
    public function forceDeleteCategories(array $ids): void
    {
        DB::transaction(function () use ($ids): void {
            $categories = Category::withTrashed()
                ->whereKey($ids)
                ->lockForUpdate()
                ->get();

            $this->assertAllFound($categories->count(), $ids);
            $this->assertNoUnselectedChildren($ids, includeTrashed: true);

            foreach ($this->sortByDepth($categories, parentsFirst: false) as $category) {
                $category->forceDelete();
            }

            $this->listingCache->invalidateAfterCommit();
        });
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    private function paginateCategoriesWithoutCache(array $filters): LengthAwarePaginator
    {
        $query = Category::query()
            ->with([
                'parent' => fn (BelongsTo $parents) => $parents
                    ->withTrashed()
                    ->select(['id', 'name', 'slug', 'deleted_at']),
            ])
            ->withCount([
                'children' => function (Builder $children) use ($filters): void {
                    if (($filters['status'] ?? 'active') === 'deleted') {
                        $children->withTrashed();
                    }
                },
            ]);

        if (($filters['status'] ?? 'active') === 'deleted') {
            $query->onlyTrashed();
        }

        if (filled($filters['search'] ?? null)) {
            $search = trim($filters['search']);
            $query->where(function (Builder $categories) use ($search): void {
                $categories
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $parent = $filters['parent'] ?? '__all__';
        if ($parent === '__root__') {
            $query->whereNull('parent_id');
        } elseif ($parent !== '__all__' && $parent !== null && $parent !== '') {
            $query->whereHas(
                'parent',
                fn (Builder $parents) => $parents
                    ->withTrashed()
                    ->where('slug', $parent),
            );
        }

        $sortColumns = [
            'name' => 'name',
            'is_active' => 'is_active',
            'is_featured' => 'is_featured',
            'children_count' => 'children_count',
            'created_at' => 'created_at',
        ];
        $sort = $filters['sort'] ?? 'name';
        $direction = ($filters['direction'] ?? 'asc') === 'desc' ? 'desc' : 'asc';

        $perPage = (int) ($filters['per_page'] ?? 10);
        $page = (int) ($filters['page'] ?? 1);
        $paginator = $query
            ->orderBy($sortColumns[$sort], $direction)
            ->orderBy('id')
            ->paginate($perPage, ['*'], 'page', $page)
            ->withQueryString();

        return $paginator->through(fn (Category $category): array => [
            ...$category->toArray(),
            'image_url' => $category->image_path === null
                ? null
                : Storage::disk('public')->url($category->image_path),
            'banner_url' => $category->banner_path === null
                ? null
                : Storage::disk('public')->url($category->banner_path),
        ]);
    }

    private function validateParent(?int $parentId, ?Category $category = null): void
    {
        if ($parentId === null) {
            return;
        }

        $ancestorId = $parentId;
        $visited = [];

        while ($ancestorId !== null) {
            if ($category !== null && $ancestorId === $category->getKey()) {
                throw ValidationException::withMessages([
                    'parent_id' => __('A category cannot be its own parent or a descendant of itself.'),
                ]);
            }

            if (isset($visited[$ancestorId])) {
                throw ValidationException::withMessages([
                    'parent_id' => __('The selected category hierarchy is invalid.'),
                ]);
            }

            $visited[$ancestorId] = true;
            $parent = Category::query()
                ->whereKey($ancestorId)
                ->lockForUpdate()
                ->first();

            if ($parent === null) {
                throw ValidationException::withMessages([
                    'parent_id' => __('The selected parent category is no longer available.'),
                ]);
            }

            $ancestorId = $parent->parent_id;
        }
    }

    /**
     * @param  list<int>  $ids
     */
    private function assertNoUnselectedChildren(array $ids, bool $includeTrashed): void
    {
        $query = Category::query()
            ->whereNotIn('id', $ids)
            ->whereIn('parent_id', $ids);

        if ($includeTrashed) {
            $query->withTrashed();
        }

        if ($query->exists()) {
            throw ValidationException::withMessages([
                'ids' => $includeTrashed
                    ? __('Permanently delete child categories before their parents.')
                    : __('Move child categories to the trash before their parents.'),
            ]);
        }
    }

    /**
     * @param  list<int>  $ids
     */
    private function assertAllFound(int $found, array $ids): void
    {
        if ($found !== count(array_unique($ids))) {
            throw ValidationException::withMessages([
                'ids' => __('One or more selected categories are no longer available. Refresh and try again.'),
            ]);
        }
    }

    /**
     * @param  EloquentCollection<int, Category>  $categories
     * @return list<Category>
     */
    private function sortByDepth(EloquentCollection $categories, bool $parentsFirst): array
    {
        $depths = [];

        foreach ($categories as $category) {
            $depth = 0;
            $parentId = $category->parent_id;
            $visited = [];

            while ($parentId !== null && ! isset($visited[$parentId])) {
                $visited[$parentId] = true;
                $depth++;
                $parentId = Category::withTrashed()->whereKey($parentId)->value('parent_id');
            }

            $depths[$category->getKey()] = $depth;
        }

        return $categories
            ->sort(function (Category $left, Category $right) use ($depths, $parentsFirst): int {
                $comparison = $depths[$left->getKey()] <=> $depths[$right->getKey()];

                return $parentsFirst ? $comparison : -$comparison;
            })
            ->values()
            ->all();
    }
}
