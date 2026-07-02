<?php

namespace App\Http\Controllers;

use App\Models\Collections;
use Illuminate\Http\Request;

class CollectionsController extends Controller
{
    public function index()
    {
        $collections = Collections::all();
        return inertia('collections/index', ['collections' => $collections]);
    }

    public function create()
    {
        return inertia('collections/create');
    }

    public function edit(Collections $collection)
    {
        $collection->load('items');
        return inertia('collections/edit', ['collection' => $collection]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'desc' => 'nullable|string',
            'is_featured' => 'boolean',
        ]);

        Collections::create($data);

        return redirect()->back()->with('success', 'Collection created successfully.');
    }

    public function update(Request $request, Collections $collection)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'desc' => 'nullable|string',
            'is_featured' => 'boolean',
        ]);

        $collection->update($data);

        return redirect()->back()->with('success', 'Collection updated successfully.');
    }

    public function destroy(Collections $collection)
    {
        $collection->delete();

        return redirect()->back()->with('success', 'Collection deleted successfully.');
    }
}
