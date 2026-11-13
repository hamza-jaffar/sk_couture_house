<?php

use App\Providers\AppServiceProvider;
use Modules\Category\Providers\CategoryServiceProvider;
use Modules\Coupon\Providers\CouponServiceProvider;
use Modules\Gallery\Providers\GalleryServiceProvider;
use Modules\Product\Providers\ProductServiceProvider;
use Modules\Setting\Providers\SettingServiceProvider;
use Modules\User\Providers\UserServiceProvider;

return [
    AppServiceProvider::class,
    UserServiceProvider::class,
    GalleryServiceProvider::class,
    CategoryServiceProvider::class,
    SettingServiceProvider::class,
    ProductServiceProvider::class,
    CouponServiceProvider::class,
];
