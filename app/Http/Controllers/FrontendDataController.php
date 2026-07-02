<?php

namespace App\Http\Controllers;

use App\Models\FrontendData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class FrontendDataController extends Controller
{
    public function edit()
    {
        $frontendData = FrontendData::first() ?? new FrontendData();
        return inertia('frontend-data/edit', ['frontendData' => $frontendData]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'hero_watermark'        => 'nullable|string|max:255',
            'hero_title'            => 'nullable|string|max:500',
            'hero_desc'             => 'nullable|string',
            'hero_image'            => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'marquee_json'          => 'nullable|string',   // JSON-encoded array
            'scroll_indicator_text' => 'nullable|string|max:100',
            'lookbook_tag'          => 'nullable|string|max:100',
            'fabric_canvas_title'   => 'nullable|string|max:255',
            'footer_title'          => 'nullable|string|max:255',
        ]);

        $frontendData = FrontendData::first();

        // ── Decode marquee JSON ──────────────────────────────────────────────
        // The frontend sends the marquee as a JSON string in `marquee_json`
        // because Inertia's Form component doesn't scan DOM inputs by name.
        $marquee = null;
        if (!empty($data['marquee_json'])) {
            $decoded = json_decode($data['marquee_json'], true);
            if (is_array($decoded)) {
                // Sanitise: keep only valid {text, color} pairs with non-empty text
                $marquee = collect($decoded)
                    ->filter(fn($item) => !empty($item['text'] ?? ''))
                    ->map(fn($item) => [
                        'text'  => substr(trim($item['text'] ?? ''), 0, 100),
                        'color' => substr(trim($item['color'] ?? '#b8952a'), 0, 30),
                    ])
                    ->values()
                    ->toArray();
            }
        }
        unset($data['marquee_json']);
        $data['marquee'] = $marquee;

        // ── Handle hero image upload ─────────────────────────────────────────
        if ($request->hasFile('hero_image')) {
            if ($frontendData && $frontendData->hero_image) {
                Storage::disk('public')->delete($frontendData->hero_image);
            }
            $data['hero_image'] = $request->file('hero_image')->store('hero', 'public');
        } else {
            // Don't overwrite existing image if none uploaded
            unset($data['hero_image']);
        }

        // ── Persist ──────────────────────────────────────────────────────────
        if ($frontendData) {
            $frontendData->update($data);
        } else {
            FrontendData::create($data);
        }

        return redirect()->back()->with('success', 'Frontend Data saved successfully.');
    }
}
