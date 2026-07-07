<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Collections;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::with(['featuredCollection', 'collections'])->get();

        return inertia('categories/index', ['categories' => $categories]);
    }

    public function create()
    {
        $collections = Collections::all();

        return inertia('categories/create', ['collections' => $collections]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'desc' => 'nullable|string',
            'featured_collection_id' => 'nullable|exists:collections,id',
        ]);

        Category::create($data);

        return redirect()->route('categories.index')->with('success', 'Category created successfully.');
    }

    public function edit(Category $category)
    {
        $category->load(['featuredCollection', 'collections']);
        $collections = Collections::all();

        return inertia('categories/edit', [
            'category' => $category,
            'collections' => $collections,
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'desc' => 'nullable|string',
            'featured_collection_id' => 'nullable|exists:collections,id',
        ]);

        $category->update($data);

        return redirect()->route('categories.index')->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return redirect()->route('categories.index')->with('success', 'Category deleted successfully.');
    }
}
