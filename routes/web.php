<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CollectionItemController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FrontendController;
use App\Http\Controllers\FrontendDataController;
use App\Http\Controllers\CollectionsController;
use App\Http\Controllers\FabricCanvasController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\PageController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Route;

// Route::get('/clear-config', function() {
//     Artisan::call('optimize:clear');
//     return 'Configuration cache cleared!';
// });

// Route::get('/storage-link', function () {
//     Artisan::call('storage:link');
//     return 'Storage link successfully';
// });

// Route::get('/migrate', function () {
//     Artisan::call('migrate --force');
//     return 'Migration run successfully';
// });


Route::get('/', [FrontendController::class, 'index'])->name('home');
Route::get('/collection-items/{id}', [FrontendController::class, 'showItem'])->name('collection-items.show');
Route::post('/invitations', [InvitationController::class, 'store'])->name('invitations.store');

Route::middleware(['auth', 'verified'])->group(function () {
    // dd(Auth::user());
    Route::get('dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');
    
    Route::get('/frontend-data', [FrontendDataController::class, 'edit'])->name('frontend-data.edit');
    Route::post('/frontend-data', [FrontendDataController::class, 'store'])->name('frontend-data.store');
    
    Route::resource('collections', CollectionsController::class);
    Route::resource('categories', CategoryController::class);
    Route::post('/collections/{collection}/items', [CollectionItemController::class, 'store'])->name('collections.items.store');
    Route::delete('/collections/{collection}/items/{item}', [CollectionItemController::class, 'destroy'])->name('collections.items.destroy');
    
    Route::resource('fabric-canvases', FabricCanvasController::class)->parameters([
        'fabric-canvases' => 'fabricCanvas'
    ]);
    
    Route::resource('invitations', InvitationController::class)->only(['index', 'update', 'destroy']);

    Route::prefix('pages')->group(function () {
        Route::get('/', [PageController::class, 'index'])->name('pages.index');
        Route::post('/', [PageController::class, 'store'])->name('pages.store');
    });
});

Route::get('/{slug}', [PageController::class, 'show'])->where('slug', '[a-z0-9-]+')->name('pages.public');

require __DIR__.'/settings.php';
