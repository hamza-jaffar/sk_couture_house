<?php

use App\Providers\AppServiceProvider;
use Modules\Category\Providers\CategoryServiceProvider;
use Modules\Gallery\Providers\GalleryServiceProvider;
use Modules\User\Providers\UserServiceProvider;

return [
    AppServiceProvider::class,
    UserServiceProvider::class,
    GalleryServiceProvider::class,
    CategoryServiceProvider::class,
];
