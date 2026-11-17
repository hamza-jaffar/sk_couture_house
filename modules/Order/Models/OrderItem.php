<?php

namespace Modules\Order\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Order\Database\Factories\OrderItemFactory;
use Modules\Product\Models\Product;
use Modules\Product\Models\ProductVariant;

#[UseFactory(OrderItemFactory::class)]
#[Fillable([
    'order_id',
    'product_id',
    'product_variant_id',
    'product_title',
    'product_slug',
    'sku',
    'selected_options',
    'quantity',
    'unit_price',
    'total_price',
    'image_url',
])]
class OrderItem extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'selected_options' => 'array',
            'quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
