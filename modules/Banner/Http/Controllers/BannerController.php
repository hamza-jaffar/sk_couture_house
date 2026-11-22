<?php

namespace Modules\Banner\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Banner\Http\Requests\BannerBulkRequest;
use Modules\Banner\Http\Requests\BannerIndexRequest;
use Modules\Banner\Http\Requests\StoreBannerRequest;
use Modules\Banner\Http\Requests\UpdateBannerRequest;
use Modules\Banner\Models\Banner;
use Modules\Banner\Services\BannerService;

class BannerController
{
    public function __construct(
        protected BannerService $bannerService,
    ) {}

    /**
     * Display listing of banners for dashboard using Inertia::defer.
     */
    public function index(BannerIndexRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('dashboard/banners', [
            'banners' => Inertia::defer(
                fn () => $this->bannerService->paginateBanners($filters),
                'banner-list',
            ),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? 'all',
                'media_type' => $filters['media_type'] ?? 'all',
                'sort' => $filters['sort'] ?? 'sort_order',
                'direction' => $filters['direction'] ?? 'asc',
                'per_page' => (int) ($filters['per_page'] ?? 15),
                'page' => (int) ($filters['page'] ?? 1),
            ],
        ]);
    }

    /**
     * Store a newly created banner.
     */
    public function store(StoreBannerRequest $request): RedirectResponse
    {
        $banner = $this->bannerService->create($request->validated());

        return back()->with('success', "Banner \"{$banner->title}\" created successfully.");
    }

    /**
     * Update the specified banner.
     */
    public function update(UpdateBannerRequest $request, Banner $banner): RedirectResponse
    {
        $this->bannerService->update($banner, $request->validated());

        return back()->with('success', "Banner \"{$banner->title}\" updated successfully.");
    }

    /**
     * Delete a banner.
     */
    public function destroy(Banner $banner): RedirectResponse
    {
        $this->bannerService->delete($banner);

        return back()->with('success', 'Banner moved to trash.');
    }

    /**
     * Restore a trashed banner.
     */
    public function restore(int $id): RedirectResponse
    {
        $this->bannerService->restore($id);

        return back()->with('success', 'Banner restored successfully.');
    }

    /**
     * Permanently delete a banner.
     */
    public function forceDelete(int $id): RedirectResponse
    {
        $this->bannerService->forceDelete($id);

        return back()->with('success', 'Banner permanently deleted.');
    }

    /**
     * Bulk delete banners.
     */
    public function bulkDestroy(BannerBulkRequest $request): RedirectResponse
    {
        $this->bannerService->bulkDestroy($request->validated('ids'));

        return back()->with('success', 'Selected banners moved to trash.');
    }

    /**
     * Bulk restore banners.
     */
    public function bulkRestore(BannerBulkRequest $request): RedirectResponse
    {
        $this->bannerService->bulkRestore($request->validated('ids'));

        return back()->with('success', 'Selected banners restored successfully.');
    }

    /**
     * Bulk force delete banners.
     */
    public function bulkForceDelete(BannerBulkRequest $request): RedirectResponse
    {
        $this->bannerService->bulkForceDelete($request->validated('ids'));

        return back()->with('success', 'Selected banners permanently deleted.');
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(Banner $banner): RedirectResponse
    {
        $this->bannerService->toggleStatus($banner);

        return back()->with('success', 'Banner status updated.');
    }

    /**
     * Reorder banners.
     */
    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array'],
            'items.*.id' => ['required', 'integer'],
            'items.*.sort_order' => ['required', 'integer'],
        ]);

        $this->bannerService->reorder($validated['items']);

        return back()->with('success', 'Banner order saved.');
    }
}
