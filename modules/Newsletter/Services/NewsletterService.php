<?php

namespace Modules\Newsletter\Services;

use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Modules\Newsletter\Models\NewsletterSubscriber;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NewsletterService
{
    public function __construct(
        private readonly NewsletterListingCache $listingCache,
    ) {}

    /**
     * Subscribe an email to the newsletter.
     *
     * @return array{status: string, message: string}
     */
    public function subscribe(string $email, ?string $ipAddress = null): array
    {
        $normalizedEmail = strtolower(trim($email));

        return DB::transaction(function () use ($normalizedEmail, $ipAddress): array {
            /** @var NewsletterSubscriber|null $subscriber */
            $subscriber = NewsletterSubscriber::withTrashed()
                ->where('email', $normalizedEmail)
                ->first();

            if ($subscriber) {
                if ($subscriber->trashed()) {
                    $subscriber->restore();
                }

                if ($subscriber->status === 'subscribed') {
                    return [
                        'status' => 'already_subscribed',
                        'message' => 'You are already subscribed to our private newsletter.',
                    ];
                }

                $subscriber->update([
                    'status' => 'subscribed',
                    'subscribed_at' => now(),
                    'unsubscribed_at' => null,
                    'ip_address' => $ipAddress,
                ]);

                $this->listingCache->invalidateAfterCommit();

                return [
                    'status' => 'subscribed',
                    'message' => 'Welcome back! You have re-subscribed to our private preview list.',
                ];
            }

            NewsletterSubscriber::create([
                'email' => $normalizedEmail,
                'status' => 'subscribed',
                'ip_address' => $ipAddress,
                'subscribed_at' => now(),
            ]);

            $this->listingCache->invalidateAfterCommit();

            return [
                'status' => 'subscribed',
                'message' => 'Thank you for subscribing to our private preview list!',
            ];
        });
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginateSubscribers(array $filters): LengthAwarePaginator
    {
        return $this->listingCache->remember($filters, function () use ($filters): LengthAwarePaginator {
            $query = NewsletterSubscriber::query();

            // Status filter
            $status = $filters['status'] ?? 'all';
            if ($status === 'subscribed') {
                $query->where('status', 'subscribed');
            } elseif ($status === 'unsubscribed') {
                $query->where('status', 'unsubscribed');
            }

            // Search filter
            if (filled($filters['search'] ?? null)) {
                $search = trim((string) $filters['search']);
                $query->where(function (Builder $b) use ($search): void {
                    $b->where('email', 'like', "%{$search}%")
                        ->orWhere('ip_address', 'like', "%{$search}%");
                });
            }

            // Sorting
            $sort = $filters['sort'] ?? 'created_at';
            $direction = $filters['direction'] ?? 'desc';
            if (! in_array($direction, ['asc', 'desc'], true)) {
                $direction = 'desc';
            }

            $query->orderBy($sort, $direction);

            $perPage = max(1, min(100, (int) ($filters['per_page'] ?? 15)));
            $paginator = $query->paginate($perPage)->withQueryString();

            return $paginator->through(fn (NewsletterSubscriber $sub): array => [
                'id' => (int) $sub->id,
                'email' => $sub->email,
                'status' => $sub->status,
                'ip_address' => $sub->ip_address,
                'subscribed_at' => $sub->subscribed_at?->toISOString(),
                'unsubscribed_at' => $sub->unsubscribed_at?->toISOString(),
                'created_at' => $sub->created_at?->toISOString(),
            ]);
        });
    }

    /**
     * Export all or filtered newsletter subscribers to a streamed CSV.
     *
     * @param  array<string, mixed>  $filters
     */
    public function exportCsv(array $filters = []): StreamedResponse
    {
        $filename = 'newsletter_subscribers_'.Carbon::now()->format('Y-m-d_His').'.csv';

        return response()->streamDownload(function () use ($filters): void {
            $handle = fopen('php://output', 'w');
            if ($handle === false) {
                return;
            }

            // UTF-8 BOM for Excel compatibility
            fwrite($handle, "\xEF\xBB\xBF");

            // CSV Header Row
            fputcsv($handle, [
                'ID',
                'Email',
                'Status',
                'Subscribed At',
                'Unsubscribed At',
                'IP Address',
                'Created At',
            ]);

            $query = NewsletterSubscriber::query();

            $status = $filters['status'] ?? 'all';
            if ($status === 'subscribed') {
                $query->where('status', 'subscribed');
            } elseif ($status === 'unsubscribed') {
                $query->where('status', 'unsubscribed');
            }

            if (filled($filters['search'] ?? null)) {
                $search = trim((string) $filters['search']);
                $query->where('email', 'like', "%{$search}%");
            }

            $query->orderBy('created_at', 'desc');

            $query->chunk(250, function ($subscribers) use ($handle): void {
                foreach ($subscribers as $sub) {
                    fputcsv($handle, [
                        $sub->id,
                        $sub->email,
                        ucfirst($sub->status),
                        $sub->subscribed_at?->format('Y-m-d H:i:s') ?? '',
                        $sub->unsubscribed_at?->format('Y-m-d H:i:s') ?? '',
                        $sub->ip_address ?? '',
                        $sub->created_at?->format('Y-m-d H:i:s') ?? '',
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function delete(NewsletterSubscriber $subscriber): void
    {
        DB::transaction(function () use ($subscriber): void {
            $subscriber->delete();
            $this->listingCache->invalidateAfterCommit();
        });
    }

    /**
     * @param  list<int>  $ids
     */
    public function bulkDestroy(array $ids): void
    {
        DB::transaction(function () use ($ids): void {
            NewsletterSubscriber::whereIn('id', $ids)->delete();
            $this->listingCache->invalidateAfterCommit();
        });
    }

    public function toggleStatus(NewsletterSubscriber $subscriber): void
    {
        DB::transaction(function () use ($subscriber): void {
            $isSubscribed = $subscriber->status === 'subscribed';
            $subscriber->update([
                'status' => $isSubscribed ? 'unsubscribed' : 'subscribed',
                'unsubscribed_at' => $isSubscribed ? now() : null,
                'subscribed_at' => $isSubscribed ? $subscriber->subscribed_at : now(),
            ]);
            $this->listingCache->invalidateAfterCommit();
        });
    }
}
