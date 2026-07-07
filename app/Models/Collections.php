<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Collections extends Model
{
    protected $fillable = ['title', 'is_featured', 'desc', 'category_id'];

    protected $casts = [
        'is_featured' => 'boolean',
    ];

    protected static function booted()
    {
        static::saving(function ($collection) {
            if ($collection->is_featured) {
                static::where('id', '!=', $collection->id)->update(['is_featured' => false]);
            }
        });
    }

    public function items()
    {
        return $this->hasMany(CollectionItem::class, 'collection_id');
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function featuredCategory()
    {
        return $this->belongsTo(Category::class, 'featured_collection_id');
    }
}
