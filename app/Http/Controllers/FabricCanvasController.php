<?php

namespace App\Http\Controllers;

use App\Models\FabricCanvas;
use Illuminate\Http\Request;

class FabricCanvasController extends Controller
{
    public function index()
    {
        $fabricCanvases = FabricCanvas::all();
        return inertia('fabric-canvases/index', ['fabricCanvases' => $fabricCanvases]);
    }

    public function create()
    {
        return inertia('fabric-canvases/create');
    }

    public function edit(FabricCanvas $fabricCanvas)
    {
        return inertia('fabric-canvases/edit', ['fabricCanvas' => $fabricCanvas]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'desc' => 'nullable|string',
            'origin_mill' => 'nullable|string',
            'density_weight' => 'nullable|string',
            'structure' => 'nullable|string',
            'formulation' => 'nullable|string',
            'rigidity' => 'nullable|string',
            'breathability' => 'nullable|string',
            'warmth' => 'nullable|integer',
            'luster' => 'nullable|integer',
        ]);

        FabricCanvas::create($data);

        return redirect()->back()->with('success', 'Fabric Canvas created successfully.');
    }

    public function update(Request $request, FabricCanvas $fabricCanvas)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'desc' => 'nullable|string',
            'origin_mill' => 'nullable|string',
            'density_weight' => 'nullable|string',
            'structure' => 'nullable|string',
            'formulation' => 'nullable|string',
            'rigidity' => 'nullable|string',
            'breathability' => 'nullable|string',
            'warmth' => 'nullable|integer',
            'luster' => 'nullable|integer',
        ]);

        $fabricCanvas->update($data);

        return redirect()->back()->with('success', 'Fabric Canvas updated successfully.');
    }

    public function destroy(FabricCanvas $fabricCanvas)
    {
        $fabricCanvas->delete();

        return redirect()->back()->with('success', 'Fabric Canvas deleted successfully.');
    }
}
