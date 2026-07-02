<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CollectionItem extends Model
{
    public $timestamps = true;

    protected $fillable = [
        'collection_id', 'peice_title', 'desc', 'note', 'gsm', 'image'
    ];

    public function collection()
    {
        return $this->belongsTo(Collections::class, 'collection_id');
    }
}
