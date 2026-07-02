<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FrontendData extends Model
{
    protected $table = 'frontend_data';

    protected $fillable = [
        'hero_watermark', 'hero_title', 'hero_desc', 'hero_image',
        'marquee', 'scroll_indicator_text', 'lookbook_tag',
        'fabric_canvas_title', 'footer_title'
    ];

    protected $casts = [
        'marquee' => 'array',
    ];

    protected static function booted()
    {
        static::creating(function ($model) {
            if (static::count() > 0) {
                return false;
            }
        });
    }
}
