<?php

namespace Modules\Coupon\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable('coupon_id', 'user_id', 'times_used')]
class CouponUser extends Model {}
