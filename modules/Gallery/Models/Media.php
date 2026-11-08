<?php

namespace Modules\Gallery\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Modules\User\Models\User;

/**
 * @property int $id
 * @property string $uuid
 * @property string $original_file_name
 * @property string $disk
 * @property string $path
 * @property int|null $uploaded_by
 * @property-read User|null $uploader
 */
#[Fillable('uuid', 'title', 'alt_text', 'caption', 'description', 'file_name', 'original_file_name', 'mime_type', 'disk', 'path', 'width', 'height', 'size', 'type', 'metadata', 'uploaded_by')]
class Media extends Model
{
    use SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
