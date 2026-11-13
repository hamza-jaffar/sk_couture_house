<?php

namespace Modules\Review\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Review\Enum\ReviewStatusEnum;
use Modules\Review\Http\Requests\ReviewBulkRequest;
use Modules\Review\Http\Requests\ReviewBulkStatusRequest;
use Modules\Review\Http\Requests\ReviewIndexRequest;
use Modules\Review\Http\Requests\ReviewResponseRequest;
use Modules\Review\Http\Requests\ReviewStatusRequest;
use Modules\Review\Models\Review;
use Modules\Review\Services\ReviewService;

class ReviewController
{
    public function __construct(private ReviewService $reviewService) {}

    public function index(ReviewIndexRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('dashboard/reviews', [
            'reviews' => Inertia::defer(
                fn () => $this->reviewService->paginateReviews($filters),
                'review-list',
            ),
            'statusOptions' => ReviewStatusEnum::options(),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'status' => $filters['status'] ?? 'all',
                'rating' => $filters['rating'] ?? 'all',
                'sort' => $filters['sort'] ?? 'created_at',
                'direction' => $filters['direction'] ?? 'desc',
                'page' => (int) ($filters['page'] ?? 1),
                'per_page' => (int) ($filters['per_page'] ?? 10),
            ],
        ]);
    }

    public function respond(ReviewResponseRequest $request, Review $review): RedirectResponse
    {
        $this->reviewService->respondToReview(
            $review,
            $request->reviewResponse(),
            $request->user()?->id,
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Response saved successfully.'),
        ]);

        return back();
    }

    public function updateStatus(ReviewStatusRequest $request, Review $review): RedirectResponse
    {
        $this->reviewService->updateStatus($review, $request->reviewStatus());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Review status updated successfully.'),
        ]);

        return back();
    }

    public function bulkStatus(ReviewBulkStatusRequest $request): RedirectResponse
    {
        $this->reviewService->bulkUpdateStatus(
            $request->reviewIds(),
            $request->reviewStatus(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Selected reviews status updated.'),
        ]);

        return back();
    }

    public function destroy(Review $review): RedirectResponse
    {
        $this->reviewService->deleteReview($review);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Review moved to trash.'),
        ]);

        return back();
    }

    public function bulkDestroy(ReviewBulkRequest $request): RedirectResponse
    {
        $this->reviewService->deleteReviews($request->reviewIds());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Selected reviews moved to trash.'),
        ]);

        return back();
    }

    public function restore(Review $review): RedirectResponse
    {
        $this->reviewService->restoreReview($review);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Review restored successfully.'),
        ]);

        return back();
    }

    public function bulkRestore(ReviewBulkRequest $request): RedirectResponse
    {
        $this->reviewService->restoreReviews($request->reviewIds());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Selected reviews restored successfully.'),
        ]);

        return back();
    }

    public function forceDelete(Review $review): RedirectResponse
    {
        $this->reviewService->forceDeleteReview($review);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Review permanently deleted.'),
        ]);

        return back();
    }

    public function bulkForceDelete(ReviewBulkRequest $request): RedirectResponse
    {
        $this->reviewService->forceDeleteReviews($request->reviewIds());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Selected reviews permanently deleted.'),
        ]);

        return back();
    }
}
