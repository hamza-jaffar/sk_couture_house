<?php

namespace Modules\Product\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Modules\Product\Database\Factories\ProductVariantFactory;

#[UseFactory(ProductVariantFactory::class)]
#[Fillable('product_id', 'sku', 'name', 'attributes', 'image')]
class ProductVariant extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'attributes' => 'array',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
