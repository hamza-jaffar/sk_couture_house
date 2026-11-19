<?php

namespace Modules\Page\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\Page\Database\Factories\PageFactory;

#[UseFactory(PageFactory::class)]
#[Fillable([
    'title',
    'slug',
    'content',
    'is_system',
    'is_active',
    'meta_title',
    'meta_description',
    'meta_keywords',
    'canonical_url',
    'og_image',
])]
class Page extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function isSystem(): bool
    {
        return (bool) $this->is_system;
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
