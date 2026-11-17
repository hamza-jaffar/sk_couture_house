<?php

namespace Modules\Order\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Modules\Order\Enum\OrderStatusEnum;
use Modules\Order\Jobs\SendOrderConfirmationEmail;
use Modules\Order\Models\Order;
use Modules\Product\Models\Product;
use Modules\Setting\Services\SiteSettingService;

class OrderService
{
    public function __construct(
        protected SiteSettingService $settings,
        protected OrderListingCache $listingCache,
    ) {}

    /**
     * Create an order from checkout data and cart items.
     *
     * @param  array<string, mixed>  $data
     * @param  array<string, array<string, mixed>>  $cartItems
     */
    public function createOrder(array $data, array $cartItems, ?int $userId = null): Order
    {
        if (empty($cartItems)) {
            throw new InvalidArgumentException('Cannot place an order with an empty cart.');
        }

        $platformSettings = $this->settings->all();
        $currency = $platformSettings['general']['currency'] ?? 'PKR';
        $currencyIcon = $platformSettings['general']['currency_icon'] ?? 'Rs.';

        return DB::transaction(function () use ($data, $cartItems, $userId, $currency, $currencyIcon): Order {
            $subtotal = 0.0;
            foreach ($cartItems as $item) {
                $subtotal += ((float) $item['unit_price'] * (int) $item['quantity']);
            }
            $total = round($subtotal, 2);

            $orderNumber = $this->generateOrderNumber();

            $order = Order::query()->create([
                'order_number' => $orderNumber,
                'type' => $data['type'] ?? 'direct',
                'status' => OrderStatusEnum::PENDING->value,
                'customer_name' => trim((string) $data['customer_name']),
                'customer_email' => trim((string) $data['customer_email']),
                'customer_phone' => trim((string) ($data['customer_phone'] ?? '')),
                'shipping_address' => [
                    'line1' => trim((string) ($data['shipping_address']['line1'] ?? '')),
                    'city' => trim((string) ($data['shipping_address']['city'] ?? '')),
                    'region' => trim((string) ($data['shipping_address']['region'] ?? '')),
                    'postal_code' => trim((string) ($data['shipping_address']['postal_code'] ?? '')),
                    'country' => trim((string) ($data['shipping_address']['country'] ?? 'Pakistan')),
                ],
                'notes' => trim((string) ($data['notes'] ?? '')),
                'subtotal' => $total,
                'total' => $total,
                'currency' => $currency,
                'currency_icon' => $currencyIcon,
                'payment_status' => 'pending',
                'payment_method' => $data['payment_method'] ?? 'cash_on_delivery',
                'metadata' => $data['metadata'] ?? null,
                'user_id' => $userId,
            ]);

            foreach ($cartItems as $item) {
                $qty = max(1, (int) $item['quantity']);
                $unitPrice = (float) $item['unit_price'];
                $itemTotal = round($unitPrice * $qty, 2);

                $order->items()->create([
                    'product_id' => $item['product_id'] ?? null,
                    'product_variant_id' => $item['variant_id'] ?? null,
                    'product_title' => $item['product_title'],
                    'product_slug' => $item['product_slug'] ?? '',
                    'sku' => $item['sku'] ?? null,
                    'selected_options' => $item['selected_options'] ?? null,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'total_price' => $itemTotal,
                    'image_url' => $item['image_url'] ?? null,
                ]);
            }

            $this->listingCache->invalidateAfterCommit();

            DB::afterCommit(function () use ($order): void {
                SendOrderConfirmationEmail::dispatch($order->load('items'));
            });

            return $order->load('items');
        });
    }

    /**
     * Update an order's status.
     */
    public function updateStatus(Order $order, string $status): Order
    {
        $statusEnum = OrderStatusEnum::tryFrom($status);
        if (! $statusEnum) {
            throw new InvalidArgumentException("Invalid order status: {$status}");
        }

        $this->listingCache->invalidateAfterCommit();

        return DB::transaction(function () use ($order, $statusEnum): Order {
            /** @var Order $lockedOrder */
            $lockedOrder = Order::query()
                ->whereKey($order->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $lockedOrder->update([
                'status' => $statusEnum->value,
            ]);

            return $lockedOrder->load('items');
        });
    }

    /**
     * Paginate orders for dashboard table with caching.
     *
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator<int, array<string, mixed>>
     */
    public function paginateOrders(array $filters): LengthAwarePaginator
    {
        return $this->listingCache->rememberList($filters, function () use ($filters): LengthAwarePaginator {
            $query = Order::query()
                ->with(['items'])
                ->withCount('items');

            if (filled($filters['status'] ?? null) && $filters['status'] !== 'all') {
                $query->where('status', $filters['status']);
            }

            if (filled($filters['payment_status'] ?? null) && $filters['payment_status'] !== 'all') {
                $query->where('payment_status', $filters['payment_status']);
            }

            if (filled($filters['type'] ?? null) && $filters['type'] !== 'all') {
                $query->where('type', $filters['type']);
            }

            if (filled($filters['search'] ?? null)) {
                $search = trim((string) $filters['search']);
                $query->where(function (Builder $b) use ($search): void {
                    $b->where('order_number', 'like', "%{$search}%")
                        ->orWhere('customer_name', 'like', "%{$search}%")
                        ->orWhere('customer_email', 'like', "%{$search}%")
                        ->orWhere('customer_phone', 'like', "%{$search}%");
                });
            }

            $sort = $filters['sort'] ?? 'created_at';
            $direction = $filters['direction'] ?? 'desc';

            $perPage = max(5, min(100, (int) ($filters['per_page'] ?? 15)));
            $page = max(1, (int) ($filters['page'] ?? request()->input('page', 1)));

            $paginator = $query->orderBy($sort, $direction)
                ->orderBy('id', $direction)
                ->paginate($perPage, ['*'], 'page', $page)
                ->withQueryString();

            return $paginator->through(fn (Order $order): array => $this->presentOrder($order));
        });
    }

    /**
     * Format single order for presentation.
     *
     * @return array<string, mixed>
     */
    public function presentOrder(Order $order): array
    {
        $status = $order->status instanceof OrderStatusEnum
            ? $order->status
            : (OrderStatusEnum::tryFrom((string) $order->status) ?? OrderStatusEnum::PENDING);

        return [
            'id' => (int) $order->id,
            'order_number' => $order->order_number,
            'type' => $order->type,
            'status' => $status->value,
            'status_label' => $status->label(),
            'status_color' => $status->color(),
            'customer_name' => $order->customer_name,
            'customer_email' => $order->customer_email,
            'customer_phone' => $order->customer_phone,
            'shipping_address' => $order->shipping_address,
            'notes' => $order->notes,
            'subtotal' => (float) $order->subtotal,
            'total' => (float) $order->total,
            'currency' => $order->currency,
            'currency_icon' => $order->currency_icon,
            'payment_status' => $order->payment_status,
            'payment_method' => $order->payment_method,
            'metadata' => $order->metadata,
            'items_count' => $order->items_count ?? $order->items->count(),
            'items' => $order->items->map(fn ($item): array => [
                'id' => (int) $item->id,
                'product_id' => $item->product_id,
                'product_title' => $item->product_title,
                'product_slug' => $item->product_slug,
                'sku' => $item->sku,
                'selected_options' => $item->selected_options,
                'quantity' => (int) $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'total_price' => (float) $item->total_price,
                'image_url' => $item->image_url,
            ])->all(),
            'created_at' => $order->created_at?->toIso8601String(),
            'created_at_human' => $order->created_at?->diffForHumans(),
        ];
    }

    /**
     * Generate unique human-readable order number.
     */
    public function generateOrderNumber(): string
    {
        do {
            $number = 'ORD-'.date('Ymd').'-'.strtoupper(Str::random(5));
        } while (Order::query()->where('order_number', $number)->exists());

        return $number;
    }

    /**
     * Build WhatsApp URL with prefilled message.
     *
     * @param  array<string, string>  $options
     */
    public function generateWhatsAppUrl(Product $product, array $options, int $quantity = 1): string
    {
        $settings = $this->settings->all();
        $contact = $settings['contact'] ?? [];
        $phone = ! empty($contact['whatsapp_number'])
            ? $contact['whatsapp_number']
            : ($contact['phone'] ?? '');

        // Sanitize phone number (strip spaces, dashes, plus)
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        if (empty($cleanPhone)) {
            // Default placeholder if no phone configured
            $cleanPhone = '923000000000';
        }

        $currency = $settings['general']['currency_icon'] ?? 'Rs.';
        $price = $product->sale_price ?? $product->price;

        $optsString = ! empty($options)
            ? implode(', ', array_map(fn ($k, $v) => "{$k}: {$v}", array_keys($options), array_values($options)))
            : 'Standard';

        $productUrl = url("/products/{$product->slug}");

        $message = "Hello SK Couture House!\n\n"
            ."I would like to place an order for:\n"
            ."*Product:* {$product->title}\n"
            .($product->sku ? "*SKU:* {$product->sku}\n" : '')
            ."*Options:* {$optsString}\n"
            ."*Quantity:* {$quantity}\n"
            ."*Price:* {$currency}".number_format((float) $price, 2)."\n"
            ."*Link:* {$productUrl}\n\n"
            .'Please let me know how to proceed with payment and delivery.';

        return 'https://wa.me/'.$cleanPhone.'?text='.urlencode($message);
    }
}
