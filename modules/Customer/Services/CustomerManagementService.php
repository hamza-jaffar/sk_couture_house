<?php

namespace Modules\Customer\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Modules\Customer\Models\Customer;
use Modules\Order\Enum\OrderStatusEnum;
use Modules\Order\Models\Order;

class CustomerManagementService
{
    public function __construct(
        protected CustomerListingCache $listingCache,
    ) {}

    /**
     * Paginate customers for dashboard table with caching.
     *
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginateCustomers(array $filters): LengthAwarePaginator
    {
        return $this->listingCache->rememberList($filters, function () use ($filters): LengthAwarePaginator {
            $query = Customer::query()
                ->withCount('orders')
                ->withSum(['orders' => function (Builder $b): void {
                    $b->where('status', '!=', OrderStatusEnum::CANCELLED->value);
                }], 'total');

            if (filled($filters['status'] ?? null) && $filters['status'] !== 'all') {
                $isActive = $filters['status'] === 'active';
                $query->where('is_active', $isActive);
            }

            if (filled($filters['search'] ?? null)) {
                $search = trim((string) $filters['search']);
                $query->where(function (Builder $b) use ($search): void {
                    $b->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            }

            $sort = $filters['sort'] ?? 'created_at';
            $direction = strtolower((string) ($filters['direction'] ?? 'desc')) === 'asc' ? 'asc' : 'desc';

            $allowedSorts = ['name', 'email', 'created_at', 'orders_count', 'orders_sum_total'];
            $sortColumn = match ($sort) {
                'orders_count' => 'orders_count',
                'total_spent', 'orders_sum_total' => 'orders_sum_total',
                'name' => 'name',
                'email' => 'email',
                default => 'created_at',
            };

            $perPage = max(5, min(100, (int) ($filters['per_page'] ?? 15)));
            $page = max(1, (int) ($filters['page'] ?? request()->input('page', 1)));

            $paginator = $query->orderBy($sortColumn, $direction)
                ->orderBy('id', $direction)
                ->paginate($perPage, ['*'], 'page', $page)
                ->withQueryString();

            return $paginator->through(fn (Customer $customer): array => $this->presentCustomer($customer));
        });
    }

    /**
     * Update customer active status.
     */
    public function updateStatus(Customer $customer, bool $isActive): Customer
    {
        $this->listingCache->invalidateAfterCommit();

        return DB::transaction(function () use ($customer, $isActive): Customer {
            /** @var Customer $lockedCustomer */
            $lockedCustomer = Customer::query()
                ->whereKey($customer->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $lockedCustomer->update([
                'is_active' => $isActive,
            ]);

            return $lockedCustomer;
        });
    }

    /**
     * Get detailed data for a single customer.
     *
     * @return array<string, mixed>
     */
    public function getCustomerDetails(Customer $customer): array
    {
        $customer->loadCount('orders');
        $customer->loadSum(['orders' => function (Builder $b): void {
            $b->where('status', '!=', OrderStatusEnum::CANCELLED->value);
        }], 'total');

        $orders = Order::query()
            ->where(function (Builder $b) use ($customer): void {
                $b->where('customer_id', $customer->id)
                    ->orWhere('customer_email', $customer->email);
            })
            ->with(['items'])
            ->withCount('items')
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return [
            'customer' => $this->presentCustomer($customer),
            'orders' => $orders,
        ];
    }

    /**
     * Present customer attributes for frontend display.
     *
     * @return array<string, mixed>
     */
    public function presentCustomer(Customer $customer): array
    {
        return [
            'id' => (int) $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'shipping_address' => $customer->shipping_address,
            'is_active' => (bool) $customer->is_active,
            'orders_count' => (int) ($customer->orders_count ?? 0),
            'total_spent' => (float) ($customer->orders_sum_total ?? 0.0),
            'email_verified_at' => $customer->email_verified_at?->toISOString(),
            'created_at' => $customer->created_at?->toISOString(),
            'created_at_human' => $customer->created_at?->diffForHumans(),
        ];
    }
}
