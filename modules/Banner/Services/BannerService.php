<?php

namespace Modules\Banner\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Modules\Banner\Models\Banner;

class BannerService
{
    public function __construct(
        private readonly BannerListingCache $listingCache,
    ) {}

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginateBanners(array $filters): LengthAwarePaginator
    {
        return $this->listingCache->remember($filters, function () use ($filters): LengthAwarePaginator {
            $query = Banner::query();

            // Status filter
            $status = $filters['status'] ?? 'all';
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            } elseif ($status === 'trash') {
                $query->onlyTrashed();
            }

            // Media type filter
            if (filled($filters['media_type'] ?? null) && $filters['media_type'] !== 'all') {
                $query->where('media_type', $filters['media_type']);
            }

            // Search filter
            if (filled($filters['search'] ?? null)) {
                $search = trim((string) $filters['search']);
                $query->where(function (Builder $b) use ($search): void {
                    $b->where('title', 'like', "%{$search}%")
                        ->orWhere('subtitle', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhere('button_text', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sort = $filters['sort'] ?? 'sort_order';
            $direction = $filters['direction'] ?? 'asc';
            if (! in_array($direction, ['asc', 'desc'], true)) {
                $direction = 'asc';
            }

            if ($sort === 'sort_order') {
                $query->orderBy('sort_order', $direction)->orderBy('id', 'asc');
            } else {
                $query->orderBy($sort, $direction);
            }

            $perPage = max(1, min(100, (int) ($filters['per_page'] ?? 15)));
            $paginator = $query->paginate($perPage)->withQueryString();

            return $paginator->through(fn (Banner $banner): array => [
                'id' => (int) $banner->id,
                'title' => $banner->title,
                'subtitle' => $banner->subtitle,
                'description' => $banner->description,
                'media_type' => $banner->media_type,
                'media_path' => $banner->media_path,
                'media_url' => $banner->media_url,
                'button_text' => $banner->button_text,
                'button_url' => $banner->button_url,
                'secondary_button_text' => $banner->secondary_button_text,
                'secondary_button_url' => $banner->secondary_button_url,
                'text_position' => $banner->text_position,
                'text_color' => $banner->text_color,
                'sort_order' => (int) $banner->sort_order,
                'is_active' => (bool) $banner->is_active,
                'deleted_at' => $banner->deleted_at?->toISOString(),
                'created_at' => $banner->created_at?->toISOString(),
                'updated_at' => $banner->updated_at?->toISOString(),
            ]);
        });
    }

    /**
     * Retrieve active banners for the storefront slider.
     *
     * @return list<array<string, mixed>>
     */
    public function getActiveBanners(): array
    {
        return $this->listingCache->rememberActive(function (): array {
            return Banner::query()
                ->where('is_active', true)
                ->orderBy('sort_order', 'asc')
                ->orderBy('id', 'asc')
                ->get()
                ->map(fn (Banner $banner): array => [
                    'id' => (int) $banner->id,
                    'title' => $banner->title,
                    'subtitle' => $banner->subtitle,
                    'description' => $banner->description,
                    'media_type' => $banner->media_type,
                    'media_url' => $banner->media_url,
                    'button_text' => $banner->button_text,
                    'button_url' => $banner->button_url,
                    'secondary_button_text' => $banner->secondary_button_text,
                    'secondary_button_url' => $banner->secondary_button_url,
                    'text_position' => $banner->text_position,
                    'text_color' => $banner->text_color,
                    'sort_order' => (int) $banner->sort_order,
                ])
                ->all();
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Banner
    {
        return DB::transaction(function () use ($data): Banner {
            $banner = Banner::create($data);
            $this->listingCache->invalidateAfterCommit();

            return $banner;
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Banner $banner, array $data): Banner
    {
        return DB::transaction(function () use ($banner, $data): Banner {
            $banner->update($data);
            $this->listingCache->invalidateAfterCommit();

            return $banner;
        });
    }

    public function delete(Banner $banner): void
    {
        DB::transaction(function () use ($banner): void {
            $banner->delete();
            $this->listingCache->invalidateAfterCommit();
        });
    }

    public function restore(int $id): void
    {
        DB::transaction(function () use ($id): void {
            Banner::onlyTrashed()->where('id', $id)->restore();
            $this->listingCache->invalidateAfterCommit();
        });
    }

    public function forceDelete(int $id): void
    {
        DB::transaction(function () use ($id): void {
            Banner::onlyTrashed()->where('id', $id)->forceDelete();
            $this->listingCache->invalidateAfterCommit();
        });
    }

    /**
     * @param  list<int>  $ids
     */
    public function bulkDestroy(array $ids): void
    {
        DB::transaction(function () use ($ids): void {
            Banner::whereIn('id', $ids)->delete();
            $this->listingCache->invalidateAfterCommit();
        });
    }

    /**
     * @param  list<int>  $ids
     */
    public function bulkRestore(array $ids): void
    {
        DB::transaction(function () use ($ids): void {
            Banner::onlyTrashed()->whereIn('id', $ids)->restore();
            $this->listingCache->invalidateAfterCommit();
        });
    }

    /**
     * @param  list<int>  $ids
     */
    public function bulkForceDelete(array $ids): void
    {
        DB::transaction(function () use ($ids): void {
            Banner::onlyTrashed()->whereIn('id', $ids)->forceDelete();
            $this->listingCache->invalidateAfterCommit();
        });
    }

    public function toggleStatus(Banner $banner): void
    {
        DB::transaction(function () use ($banner): void {
            $banner->update(['is_active' => ! $banner->is_active]);
            $this->listingCache->invalidateAfterCommit();
        });
    }

    /**
     * @param  list<array{id: int, sort_order: int}>  $items
     */
    public function reorder(array $items): void
    {
        DB::transaction(function () use ($items): void {
            foreach ($items as $item) {
                Banner::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
            }
            $this->listingCache->invalidateAfterCommit();
        });
    }
}
