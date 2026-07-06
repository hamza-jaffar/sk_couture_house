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
            $html = $this->sanitizeHtml($html);

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

        // Sanitize stored HTML on display as a safety-net for legacy content
        $page->html = $this->sanitizeHtml($page->html ?? '');

        return inertia('pages/show', [
            'page' => $page,
        ]);
    }

    /**
     * Sanitize HTML by removing inline styles and unwrapping <mark> tags.
     * This is a lightweight sanitizer to remove pasted background highlights
     * and other inline style artifacts. For stronger sanitization consider
     * using a library like HTMLPurifier.
     */
    private function sanitizeHtml(string $html): string
    {
        if (trim($html) === '') {
            return $html;
        }

        libxml_use_internal_errors(true);
        $doc = new \DOMDocument();
        // Ensure proper encoding handling
        $doc->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);

        $xpath = new \DOMXPath($doc);

        // Remove all style attributes
        foreach ($xpath->query('//*[@style]') as $node) {
            /** @var \DOMElement $node */
            $node->removeAttribute('style');
        }

        // Remove bgcolor attributes
        foreach ($xpath->query('//*[@bgcolor]') as $node) {
            /** @var \DOMElement $node */
            $node->removeAttribute('bgcolor');
        }

        // Unwrap <mark> tags (replace with their children)
        foreach ($doc->getElementsByTagName('mark') as $mark) {
            $parent = $mark->parentNode;
            while ($mark->firstChild) {
                $parent->insertBefore($mark->firstChild, $mark);
            }
            $parent->removeChild($mark);
        }

        // Optional: remove comments
        foreach ($xpath->query('//comment()') as $c) {
            $c->parentNode->removeChild($c);
        }

        $clean = $doc->saveHTML();
        // Remove the xml encoding hack we added
        $clean = preg_replace('/^<\?xml.*?\?>/s', '', $clean);

        libxml_clear_errors();

        return trim($clean);
    }
}
