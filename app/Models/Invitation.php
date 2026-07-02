<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invitation extends Model
{
    protected $fillable = [
        'name', 'email', 'fabric', 'date', 'notes', 'status'
    ];
}
