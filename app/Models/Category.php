<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = ['name', 'desc', 'featured_collection_id'];

    public function featuredCollection()
    {
        return $this->belongsTo(Collections::class, 'featured_collection_id');
    }

    public function collections()
    {
        return $this->hasMany(Collections::class, 'category_id');
    }
}
