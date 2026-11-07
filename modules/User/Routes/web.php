<?php

use Illuminate\Support\Facades\Route;

Route::get('/user', function () {
    return auth()->user() ?? 'User Not Available';
});

require __DIR__.'/setting.php';
require __DIR__.'/auth.php';

