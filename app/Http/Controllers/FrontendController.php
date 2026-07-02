<?php

namespace App\Http\Controllers;

use App\Models\Collections;
use App\Models\FabricCanvas;
use App\Models\FrontendData;

class FrontendController extends Controller
{
    public function index()
    {
        $frontendData = FrontendData::first();

        $featuredCollection = Collections::where('is_featured', true)
            ->with('items')
            ->first();

        $fabricCanvases = FabricCanvas::all();

        return inertia('welcome', [
            'frontendData'       => $frontendData,
            'featuredCollection' => $featuredCollection,
            'fabricCanvases'     => $fabricCanvases,
        ]);
    }

    public function showItem($id)
    {
        $frontendData = FrontendData::first();
        $fabricCanvases = FabricCanvas::all();
        $item = \App\Models\CollectionItem::with('collection')->findOrFail($id);

        return inertia('collection-item', [
            'frontendData'   => $frontendData,
            'fabricCanvases' => $fabricCanvases,
            'item'           => $item,
        ]);
    }
}
