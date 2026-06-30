<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function dashboard(Request $request)
    {
        // Check if the user is an admin
        if ($request->user()->type === 'admin') {

            // Optional: uncomment this only when you are debugging
            // dd($request->user());

            return inertia('dashboard');
        }

        // Properly return a 403 Forbidden response
        abort(403, 'Unauthorized action.');
    }
}
