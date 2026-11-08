<?php

namespace Modules\Gallery\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Gallery\Http\Requests\GalleryIndexRequest;
use Modules\Gallery\Http\Requests\ManageMediaRequest;
use Modules\Gallery\Http\Requests\UploadMediaRequest;
use Modules\Gallery\Models\Media;
use Modules\Gallery\Service\GalleryService;
use Modules\User\Models\User;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GalleryController
{
    public function __construct(private GalleryService $galleryService) {}

    public function index(GalleryIndexRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('dashboard/gallery', [
            'media' => Inertia::scroll(fn () => $this->galleryService->paginate($filters)),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'category' => $filters['category'] ?? 'all',
                'page' => (int) ($filters['page'] ?? 1),
                'per_page' => (int) ($filters['per_page'] ?? 24),
            ],
            'canUpload' => $request->user()?->can('gallery.upload') ?? false,
            'canDelete' => $request->user()?->can('gallery.delete') ?? false,
            'canRestore' => $request->user()?->can('gallery.restore') ?? false,
            'canForceDelete' => $request->user()?->can('gallery.force-delete') ?? false,
        ]);
    }

    public function picker(GalleryIndexRequest $request): JsonResponse
    {
        $filters = $request->validated();

        if (($filters['category'] ?? 'all') === 'deleted') {
            $filters['category'] = 'all';
        }

        return response()->json($this->galleryService->paginate($filters)->toArray());
    }

    public function upload(UploadMediaRequest $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $fileCount = $this->galleryService->upload($request->uploadedFiles(), $user);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => trans_choice(':count file uploaded successfully.|:count files uploaded successfully.', $fileCount, ['count' => $fileCount]),
        ]);

        return to_route('dashboard.gallery.index');
    }

    public function download(Request $request, Media $media): StreamedResponse
    {
        abort_unless($request->user()?->can('gallery.view'), 403);

        return $this->galleryService->download($media);
    }

    public function destroy(ManageMediaRequest $request): RedirectResponse
    {
        $count = $this->galleryService->moveToTrash($request->mediaUuids());

        return $this->flashAndReturn($count, 'moved to the trash');
    }

    public function restore(ManageMediaRequest $request): RedirectResponse
    {
        $count = $this->galleryService->restore($request->mediaUuids());

        return $this->flashAndReturn($count, 'restored');
    }

    public function forceDelete(ManageMediaRequest $request): RedirectResponse
    {
        $count = $this->galleryService->permanentlyDelete($request->mediaUuids());

        return $this->flashAndReturn($count, 'permanently deleted');
    }

    private function flashAndReturn(int $count, string $action): RedirectResponse
    {
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => trans_choice(":count file {$action} successfully.|:count files {$action} successfully.", $count, ['count' => $count]),
        ]);

        return back();
    }
}
