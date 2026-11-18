<?php

namespace Modules\Review\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Modules\Review\Enum\ReviewStatusEnum;
use Modules\Review\Models\Review;

class ReviewService
{
    public function __construct(private ReviewListingCache $listingCache) {}

    /**
     * @param  array{
     *     search?: string|null,
     *     status?: string|null,
     *     rating?: int|string|null,
     *     sort?: string,
     *     direction?: 'asc'|'desc',
     *     per_page?: int|string,
     *     page?: int|string
     * }  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginateReviews(array $filters): LengthAwarePaginator
    {
        return $this->listingCache->remember(
            $filters,
            fn (): LengthAwarePaginator => $this->paginateReviewsWithoutCache($filters),
        );
    }

    public function respondToReview(Review $review, string $response, ?int $adminId = null): Review
    {
        $this->listingCache->invalidateAfterCommit();

        return DB::transaction(function () use ($review, $response, $adminId): Review {
            $review = Review::query()
                ->whereKey($review->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $review->update([
                'admin_response' => trim($response),
                'responded_at' => now(),
                'responded_by' => $adminId,
            ]);

            return $review;
        });
    }

    public function updateStatus(Review $review, string $status): Review
    {
        $this->listingCache->invalidateAfterCommit();

        return DB::transaction(function () use ($review, $status): Review {
            $review = Review::query()
                ->whereKey($review->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $review->update([
                'status' => $status,
            ]);

            return $review;
        });
    }

    /**
     * @param  list<int>  $ids
     */
    public function bulkUpdateStatus(array $ids, string $status): void
    {
        $this->listingCache->invalidateAfterCommit();

        DB::transaction(function () use ($ids, $status): void {
            $reviews = Review::query()
                ->whereKey($ids)
                ->lockForUpdate()
                ->get();

            $this->assertAllFound($reviews->count(), $ids);

            foreach ($reviews as $review) {
                $review->update(['status' => $status]);
            }
        });
    }

    public function deleteReview(Review $review): void
    {
        $this->deleteReviews([$review->getKey()]);
    }

    /**
     * @param  list<int>  $ids
     */
    public function deleteReviews(array $ids): void
    {
        $this->listingCache->invalidateAfterCommit();

        DB::transaction(function () use ($ids): void {
            $reviews = Review::query()
                ->whereKey($ids)
                ->lockForUpdate()
                ->get();

            $this->assertAllFound($reviews->count(), $ids);

            foreach ($reviews as $review) {
                $review->delete();
            }
        });
    }

    public function restoreReview(Review $review): void
    {
        $this->restoreReviews([$review->getKey()]);
    }

    /**
     * @param  list<int>  $ids
     */
    public function restoreReviews(array $ids): void
    {
        $this->listingCache->invalidateAfterCommit();

        DB::transaction(function () use ($ids): void {
            $reviews = Review::withTrashed()
                ->whereKey($ids)
                ->whereNotNull('deleted_at')
                ->lockForUpdate()
                ->get();

            $this->assertAllFound($reviews->count(), $ids);

            foreach ($reviews as $review) {
                $review->restore();
            }
        });
    }

    public function forceDeleteReview(Review $review): void
    {
        $this->forceDeleteReviews([$review->getKey()]);
    }

    /**
     * @param  list<int>  $ids
     */
    public function forceDeleteReviews(array $ids): void
    {
        $this->listingCache->invalidateAfterCommit();

        DB::transaction(function () use ($ids): void {
            $reviews = Review::withTrashed()
                ->whereKey($ids)
                ->lockForUpdate()
                ->get();

            $this->assertAllFound($reviews->count(), $ids);

            foreach ($reviews as $review) {
                $review->forceDelete();
            }
        });
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    private function paginateReviewsWithoutCache(array $filters): LengthAwarePaginator
    {
        $query = Review::query()
            ->with([
                'product:id,title,slug,price',
                'user:id,name,email',
                'responder:id,name',
            ]);

        $status = $filters['status'] ?? 'all';
        if ($status === 'deleted') {
            $query->onlyTrashed();
        } elseif ($status !== 'all' && filled($status)) {
            $query->where('status', $status);
        }

        if (filled($filters['rating'] ?? null) && $filters['rating'] !== 'all') {
            $query->where('rating', (int) $filters['rating']);
        }

        if (filled($filters['search'] ?? null)) {
            $search = trim($filters['search']);
            $query->where(function (Builder $q) use ($search): void {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('comment', 'like', "%{$search}%")
                    ->orWhere('author_name', 'like', "%{$search}%")
                    ->orWhere('author_email', 'like', "%{$search}%")
                    ->orWhereHas('product', fn (Builder $pq) => $pq->where('title', 'like', "%{$search}%"))
                    ->orWhereHas('user', fn (Builder $uq) => $uq->where('name', 'like', "%{$search}%"));
            });
        }

        $sortColumns = [
            'created_at' => 'created_at',
            'rating' => 'rating',
            'status' => 'status',
            'author_name' => 'author_name',
        ];

        $sort = $filters['sort'] ?? 'created_at';
        $sort = array_key_exists($sort, $sortColumns) ? $sort : 'created_at';
        $direction = ($filters['direction'] ?? 'desc') === 'asc' ? 'asc' : 'desc';

        $perPage = (int) ($filters['per_page'] ?? 10);
        $page = (int) ($filters['page'] ?? 1);

        $paginator = $query
            ->orderBy($sortColumns[$sort], $direction)
            ->orderBy('id')
            ->paginate($perPage, ['*'], 'page', $page)
            ->withQueryString();

        return $paginator->through(fn (Review $review): array => [
            ...$review->toArray(),
            'status' => $review->status->value,
            'status_label' => $review->status->label(),
            'responded_at' => $review->responded_at?->toISOString(),
            'created_at' => $review->created_at->toISOString(),
            'reviewer_display_name' => $review->user?->name ?? $review->author_name ?? 'Anonymous',
            'reviewer_display_email' => $review->user?->email ?? $review->author_email,
        ]);
    }

    /**
     * @param  list<int>  $ids
     */
    private function assertAllFound(int $found, array $ids): void
    {
        if ($found !== count(array_unique($ids))) {
            throw ValidationException::withMessages([
                'ids' => __('One or more selected reviews are no longer available. Refresh and try again.'),
            ]);
        }
    }

    /**
     * Submit a new customer review for moderation.
     *
     * @param  array<string, mixed>  $data
     */
    public function submitReview(array $data): Review
    {
        $this->listingCache->invalidateAfterCommit();

        return Review::create([
            'product_id' => $data['product_id'],
            'user_id' => $data['user_id'] ?? null,
            'customer_id' => $data['customer_id'] ?? null,
            'author_name' => trim((string) $data['author_name']),
            'author_email' => trim((string) $data['author_email']),
            'rating' => (int) $data['rating'],
            'title' => trim((string) $data['title']),
            'comment' => trim((string) $data['comment']),
            'status' => ReviewStatusEnum::Approved,
        ]);
    }

    /**
     * Get approved reviews summary and ratings distribution for a product.
     *
     * @return array<string, mixed>
     */
    public function getProductReviewsSummary(int $productId): array
    {
        $approvedReviews = Review::query()
            ->where('product_id', $productId)
            ->where('status', ReviewStatusEnum::Approved->value)
            ->latest('created_at')
            ->get();

        $total = $approvedReviews->count();
        $average = $total > 0 ? round((float) $approvedReviews->avg('rating'), 1) : 0.0;

        $ratingCounts = [5 => 0, 4 => 0, 3 => 0, 2 => 0, 1 => 0];
        foreach ($approvedReviews as $r) {
            $star = (int) $r->rating;
            if (isset($ratingCounts[$star])) {
                $ratingCounts[$star]++;
            }
        }

        $ratingPercentages = [];
        foreach ($ratingCounts as $star => $count) {
            $ratingPercentages[$star] = $total > 0 ? (int) round(($count / $total) * 100) : 0;
        }

        $items = $approvedReviews->map(fn (Review $r): array => [
            'id' => $r->id,
            'author_name' => $r->author_name,
            'rating' => (int) $r->rating,
            'title' => $r->title,
            'comment' => $r->comment,
            'admin_response' => $r->admin_response,
            'created_at' => $r->created_at->toISOString(),
            'created_at_human' => $r->created_at->diffForHumans(),
        ])->all();

        return [
            'total_reviews' => $total,
            'average_rating' => $average,
            'rating_counts' => $ratingCounts,
            'rating_percentages' => $ratingPercentages,
            'items' => $items,
        ];
    }
}
