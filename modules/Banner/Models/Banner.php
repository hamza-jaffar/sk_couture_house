<?php

namespace Modules\Banner\Models;

use App\Helpers\FileHelper;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Banner\Database\Factories\BannerFactory;

class Banner extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'subtitle',
        'description',
        'media_type',
        'media_path',
        'button_text',
        'button_url',
        'secondary_button_text',
        'secondary_button_url',
        'text_position',
        'text_color',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    protected $appends = [
        'media_url',
    ];

    protected static function newFactory(): BannerFactory
    {
        return BannerFactory::new();
    }

    protected function mediaUrl(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => $this->media_path ? FileHelper::url($this->media_path, 'public') : null
        );
    }
}
