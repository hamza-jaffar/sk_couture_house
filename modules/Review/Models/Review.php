<?php

namespace Modules\Review\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Product\Models\Product;
use Modules\Review\Database\Factories\ReviewFactory;
use Modules\Review\Enum\ReviewStatusEnum;
use Modules\User\Models\User;

#[UseFactory(ReviewFactory::class)]
#[Fillable(
    'product_id',
    'user_id',
    'author_name',
    'author_email',
    'rating',
    'title',
    'comment',
    'status',
    'admin_response',
    'responded_at',
    'responded_by',
)]
class Review extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'product_reviews';

    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'status' => ReviewStatusEnum::class,
            'responded_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function responder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responded_by');
    }
}
