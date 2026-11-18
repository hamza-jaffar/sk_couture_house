<?php

namespace Modules\Order\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Customer\Models\Customer;
use Modules\Order\Database\Factories\OrderFactory;
use Modules\Order\Enum\OrderStatusEnum;
use Modules\User\Models\User;

#[UseFactory(OrderFactory::class)]
#[Fillable([
    'order_number',
    'type',
    'status',
    'customer_name',
    'customer_email',
    'customer_phone',
    'shipping_address',
    'notes',
    'subtotal',
    'total',
    'currency',
    'currency_icon',
    'payment_status',
    'payment_method',
    'coupon_code',
    'discount_amount',
    'metadata',
    'user_id',
    'customer_id',
])]
class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'shipping_address' => 'array',
            'metadata' => 'array',
            'subtotal' => 'decimal:2',
            'total' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'status' => OrderStatusEnum::class,
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'order_number';
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function isDirect(): bool
    {
        return $this->type === 'direct';
    }

    public function isWhatsApp(): bool
    {
        return $this->type === 'whatsapp';
    }
}
