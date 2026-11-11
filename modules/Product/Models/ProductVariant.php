<?php

namespace Modules\Product\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable('product_id', 'sku', 'name', 'price', 'sale_price', 'stock', 'attributes', 'image')]
class ProductVariant extends Model
{
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'stock' => 'integer',
            'attributes' => 'array',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
