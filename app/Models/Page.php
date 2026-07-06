<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable('name', 'title', 'slug', 'html')]
class Page extends Model
{
    protected $guarded = [];
}
