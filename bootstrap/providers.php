<?php

use App\Providers\AppServiceProvider;
use Modules\Banner\Providers\BannerServiceProvider;
use Modules\Category\Providers\CategoryServiceProvider;
use Modules\Coupon\Providers\CouponServiceProvider;
use Modules\Customer\Providers\CustomerServiceProvider;
use Modules\Gallery\Providers\GalleryServiceProvider;
use Modules\Newsletter\Providers\NewsletterServiceProvider;
use Modules\Order\Providers\OrderServiceProvider;
use Modules\Page\Providers\PageServiceProvider;
use Modules\Product\Providers\ProductServiceProvider;
use Modules\Report\Providers\ReportServiceProvider;
use Modules\Review\Providers\ReviewServiceProvider;
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
    ReviewServiceProvider::class,
    OrderServiceProvider::class,
    CustomerServiceProvider::class,
    ReportServiceProvider::class,
    PageServiceProvider::class,
    BannerServiceProvider::class,
    NewsletterServiceProvider::class,
];
