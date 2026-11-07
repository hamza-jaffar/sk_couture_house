<?php

namespace Modules\User\Models;

use Spatie\Permission\Models\Role as SpatieRole;

/**
 * @property bool $is_system
 */
class Role extends SpatieRole
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
        ];
    }
}
