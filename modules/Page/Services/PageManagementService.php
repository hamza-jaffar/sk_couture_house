<?php

namespace Modules\Page\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Modules\Page\Models\Page;

class PageManagementService
{
    public function __construct(
        protected PageListingCache $listingCache,
    ) {}

    /**
     * Paginate pages for dashboard table with caching.
     *
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginatePages(array $filters): LengthAwarePaginator
    {
        return $this->listingCache->rememberList($filters, function () use ($filters): LengthAwarePaginator {
            $query = Page::query();

            if (filled($filters['search'] ?? null)) {
                $search = trim((string) $filters['search']);
                $query->where(function ($b) use ($search): void {
                    $b->where('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            }

            if (filled($filters['status'] ?? null) && $filters['status'] !== 'all') {
                $isActive = $filters['status'] === 'active';
                $query->where('is_active', $isActive);
            }

            if (filled($filters['type'] ?? null) && $filters['type'] !== 'all') {
                $isSystem = $filters['type'] === 'system';
                $query->where('is_system', $isSystem);
            }

            $sort = $filters['sort'] ?? 'created_at';
            $direction = strtolower((string) ($filters['direction'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

            $sortColumn = match ($sort) {
                'title' => 'title',
                'slug' => 'slug',
                default => 'created_at',
            };

            $perPage = max(5, min(100, (int) ($filters['per_page'] ?? 15)));
            $page = max(1, (int) ($filters['page'] ?? request()->input('page', 1)));

            $paginator = $query->orderBy($sortColumn, $direction)
                ->orderBy('id', $direction)
                ->paginate($perPage, ['*'], 'page', $page)
                ->withQueryString();

            return $paginator->through(fn (Page $page): array => $this->presentPage($page));
        });
    }

    /**
     * Create a new page.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Page
    {
        $this->listingCache->invalidateAfterCommit();

        return Page::create([
            'title' => $data['title'],
            'slug' => $data['slug'] ?? Str::slug($data['title']),
            'content' => $data['content'],
            'is_system' => false,
            'is_active' => (bool) ($data['is_active'] ?? true),
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
            'meta_keywords' => $data['meta_keywords'] ?? null,
            'canonical_url' => $data['canonical_url'] ?? null,
            'og_image' => $data['og_image'] ?? null,
        ]);
    }

    /**
     * Update an existing page (content only for system pages).
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Page $page, array $data): Page
    {
        $this->listingCache->invalidateAfterCommit();

        $updateData = [
            'content' => $data['content'],
            'is_active' => (bool) ($data['is_active'] ?? true),
            'meta_title' => $data['meta_title'] ?? null,
            'meta_description' => $data['meta_description'] ?? null,
            'meta_keywords' => $data['meta_keywords'] ?? null,
            'canonical_url' => $data['canonical_url'] ?? null,
            'og_image' => $data['og_image'] ?? null,
        ];

        // Only allow title/slug updates for user-created pages
        if (! $page->is_system) {
            $updateData['title'] = $data['title'];

            if (filled($data['slug'] ?? null)) {
                $updateData['slug'] = Str::slug($data['slug']);
            }
        }

        $page->update($updateData);

        return $page->refresh();
    }

    /**
     * Soft-delete a user-created page.
     */
    public function delete(Page $page): void
    {
        if ($page->is_system) {
            abort(403, 'System pages cannot be deleted.');
        }

        $this->listingCache->invalidateAfterCommit();
        $page->delete();
    }

    /**
     * Present page attributes for frontend display.
     *
     * @return array<string, mixed>
     */
    public function presentPage(Page $page): array
    {
        return [
            'id' => (int) $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'content' => $page->content,
            'is_system' => (bool) $page->is_system,
            'is_active' => (bool) $page->is_active,
            'meta_title' => $page->meta_title,
            'meta_description' => $page->meta_description,
            'meta_keywords' => $page->meta_keywords,
            'canonical_url' => $page->canonical_url,
            'og_image' => $page->og_image,
            'created_at' => $page->created_at?->toISOString(),
            'created_at_human' => $page->created_at?->diffForHumans(),
            'updated_at' => $page->updated_at?->toISOString(),
        ];
    }
}
