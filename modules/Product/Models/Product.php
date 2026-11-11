<?php

namespace Modules\Product\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Category\Enum\OrderTypeEnum;
use Modules\Category\Models\Category;
use Modules\Product\Database\Factories\ProductFactory;

#[UseFactory(ProductFactory::class)]
#[Fillable('title', 'slug', 'short_description', 'description', 'price', 'sale_price', 'sale_start_at', 'sale_end_at', 'sku', 'stock', 'type', 'status', 'is_featured', 'category_id', 'metadata', 'images', 'variant_options', 'meta_title', 'meta_description', 'meta_keywords', 'canonical_url', 'og_title', 'og_description', 'og_image', 'robots_meta')]
class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'sale_price' => 'decimal:2',
            'sale_start_at' => 'date',
            'sale_end_at' => 'date',
            'stock' => 'integer',
            'is_featured' => 'boolean',
            'metadata' => 'array',
            'images' => 'array',
            'variant_options' => 'array',
        ];
    }

    protected $appends = [
        'effective_order_type',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    protected function seoTitle(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->meta_title ?? $this->title.' | '.config('app.name')
        );
    }

    protected function seoDescription(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->meta_description ?? $this->short_description ?? str($this->description)->limit(150)
        );
    }

    protected function effectiveOrderType(): Attribute
    {
        return Attribute::make(
            get: function (): string {
                $type = $this->category?->order_type;

                if ($type instanceof OrderTypeEnum) {
                    return $type->value;
                }

                if (is_string($type) && filled($type)) {
                    return $type;
                }

                return OrderTypeEnum::DIRECT->value;
            }
        );
    }
}
