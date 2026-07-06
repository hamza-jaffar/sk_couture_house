<?php

namespace App\Http\Controllers;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PageController extends Controller
{
    private array $pageDefinitions = [
        'privacy-policy' => [
            'name' => 'Privacy Policy',
            'slug' => 'privacy-policy',
        ],
        'rules-and-regulation' => [
            'name' => 'Rules and Regulation',
            'slug' => 'rules-and-regulation',
        ],
        'policies' => [
            'name' => 'Policies',
            'slug' => 'policies',
        ],
    ];

    public function index()
    {
        $pages = Page::whereIn('slug', array_column($this->pageDefinitions, 'slug'))
            ->get()
            ->keyBy('slug');

        $payload = [];
        foreach ($this->pageDefinitions as $key => $definition) {
            $page = $pages->get($definition['slug']);
            $payload[$key] = [
                'id' => $page?->id,
                'name' => $page?->name ?? $definition['name'],
                'title' => $page?->title ?? $definition['name'],
                'slug' => $page?->slug ?? $definition['slug'],
                'html' => $page?->html ?? '',
            ];
        }

        return inertia('pages/index', ['pages' => $payload]);
    }

    public function store(Request $request)
    {
        foreach ($this->pageDefinitions as $key => $definition) {
            $input = $request->input($key, []);

            $validated = Validator::make($input, [
                'name' => ['nullable', 'string', 'max:255'],
                'title' => ['nullable', 'string', 'max:255'],
                'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
                'html' => ['nullable', 'string'],
            ])->validate();

            $slug = $validated['slug'] ?? $definition['slug'];
            $name = $validated['name'] ?? $definition['name'];
            $title = $validated['title'] ?? $name;
            $html = $validated['html'] ?? '';

            $page = Page::firstOrNew(['slug' => $slug]);
            $page->fill([
                'name' => $name,
                'slug' => $slug,
                'title' => $title,
                'html' => $html,
            ]);
            $page->save();
        }

        return redirect()->route('pages.index')->with('success', 'Pages updated successfully.');
    }

    public function show(string $slug)
    {
        $page = Page::where('slug', $slug)->firstOrFail();

        return inertia('pages/show', [
            'page' => $page,
        ]);
    }
}
