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
        $categories = \App\Models\Category::all();

        return inertia('collections/create', ['categories' => $categories]);
    }

    public function edit(Collections $collection)
    {
        $collection->load('items');
        $categories = \App\Models\Category::all();

        return inertia('collections/edit', [
            'collection' => $collection,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'desc' => 'nullable|string',
            'is_featured' => 'boolean',
            'category_id' => 'nullable|exists:categories,id',
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
            'category_id' => 'nullable|exists:categories,id',
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
