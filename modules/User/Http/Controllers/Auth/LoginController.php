<?php

namespace Modules\User\Http\Controllers\Auth;

use Illuminate\Http\Request;

class LoginController
{
    public function index()
    {
        return inertia('auth/login');
    }

    public function login(Request $request)
    {
        dd($request->all());
    }
}
