<?php

namespace Modules\Customer\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\UseFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Modules\Customer\Database\Factories\CustomerFactory;
use Modules\Order\Models\Order;

#[UseFactory(CustomerFactory::class)]
#[Fillable([
    'name',
    'email',
    'password',
    'phone',
    'shipping_address',
    'is_active',
    'email_verified_at',
])]
#[Hidden([
    'password',
    'remember_token',
])]
class Customer extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes;

    protected function casts(): array
    {
        return [
            'shipping_address' => 'array',
            'is_active' => 'boolean',
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
