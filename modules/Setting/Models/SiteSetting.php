<?php

namespace Modules\Setting\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable('group', 'payload')]
class SiteSetting extends Model
{
    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }
}
