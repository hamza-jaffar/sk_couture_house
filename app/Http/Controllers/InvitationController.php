<?php

namespace App\Http\Controllers;

use App\Models\Invitation;
use Illuminate\Http\Request;

class InvitationController extends Controller
{
    public function index()
    {
        $invitations = Invitation::orderBy('created_at', 'desc')->get();
        return inertia('invitations/index', [
            'invitations' => $invitations
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'fabric' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        Invitation::create($validated);

        return redirect()->back()->with('success', 'Invitation request sent successfully.');
    }

    public function update(Request $request, Invitation $invitation)
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,contacted,declined,completed',
        ]);

        $invitation->update($validated);

        return redirect()->back()->with('success', 'Invitation status updated.');
    }

    public function destroy(Invitation $invitation)
    {
        $invitation->delete();

        return redirect()->back()->with('success', 'Invitation deleted.');
    }
}
