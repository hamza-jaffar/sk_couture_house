<?php

namespace App\Http\Controllers;

use App\Models\CollectionItem;
use App\Models\Collections;
use Illuminate\Http\Request;

class CollectionItemController extends Controller
{
    public function store(Request $request, Collections $collection)
    {
        $data = $request->validate([
            'piece_title' => 'required|string|max:255',
            'desc' => 'nullable|string',
            'note' => 'nullable|string',
            'gsm' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('collection_items', 'public');
        }

        $collection->items()->create([
            'peice_title' => $data['piece_title'],
            'desc'  => $data['desc'] ?? null,
            'note'  => $data['note'] ?? null,
            'gsm'   => $data['gsm'] ?? null,
            'image' => $imagePath,
        ]);

        return back()->with('success', 'Item added successfully');
    }

    public function destroy(Collections $collection, CollectionItem $item)
    {
        if ($item->collections_id !== $collection->id) {
            abort(403);
        }

        $item->delete();

        return back()->with('success', 'Item deleted successfully');
    }
}
