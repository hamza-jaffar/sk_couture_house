<?php

namespace Modules\Newsletter\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Modules\Newsletter\Http\Requests\SubscribeNewsletterRequest;
use Modules\Newsletter\Services\NewsletterService;

class FrontendNewsletterController
{
    public function __construct(
        private readonly NewsletterService $newsletterService,
    ) {}

    /**
     * Subscribe an email address to the newsletter.
     */
    public function subscribe(SubscribeNewsletterRequest $request): RedirectResponse
    {
        $result = $this->newsletterService->subscribe(
            $request->validated('email'),
            $request->ip(),
        );

        Inertia::flash('toast', [
            'type' => $result['status'] === 'already_subscribed' ? 'info' : 'success',
            'message' => $result['message'],
        ]);

        return back()->with('success', $result['message']);
    }
}
