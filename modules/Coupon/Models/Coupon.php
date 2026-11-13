<?php

namespace Modules\Coupon\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Coupon\Database\Factories\CouponFactory;
use Modules\Coupon\Enum\DiscountTypeEnum;
use Modules\User\Models\User;

#[UseFactory(CouponFactory::class)]
#[Fillable(
    'code',
    'description',
    'discount_type',
    'discount_value',
    'min_spend',
    'max_discount',
    'usage_limit',
    'usage_limit_per_user',
    'times_used',
    'starts_at',
    'expires_at',
    'is_active',
)]
class Coupon extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'discount_type' => DiscountTypeEnum::class,
            'discount_value' => 'decimal:2',
            'min_spend' => 'decimal:2',
            'max_discount' => 'decimal:2',
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'coupon_user')
            ->withPivot('times_used')
            ->withTimestamps();
    }
}
