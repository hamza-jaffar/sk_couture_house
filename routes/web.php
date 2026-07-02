<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FrontendController;
use App\Http\Controllers\FrontendDataController;
use App\Http\Controllers\CollectionsController;
use App\Http\Controllers\FabricCanvasController;
use App\Http\Controllers\InvitationController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', [FrontendController::class, 'index'])->name('home');
Route::get('/collection-items/{id}', [FrontendController::class, 'showItem'])->name('collection-items.show');
Route::post('/invitations', [InvitationController::class, 'store'])->name('invitations.store');

Route::middleware(['auth', 'verified'])->group(function () {
    // dd(Auth::user());
    Route::get('dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');
    
    Route::get('/frontend-data', [FrontendDataController::class, 'edit'])->name('frontend-data.edit');
    Route::post('/frontend-data', [FrontendDataController::class, 'store'])->name('frontend-data.store');
    
    Route::resource('collections', CollectionsController::class);
    Route::post('/collections/{collection}/items', [CollectionItemController::class, 'store'])->name('collections.items.store');
    Route::delete('/collections/{collection}/items/{item}', [CollectionItemController::class, 'destroy'])->name('collections.items.destroy');
    
    Route::resource('fabric-canvases', FabricCanvasController::class)->parameters([
        'fabric-canvases' => 'fabricCanvas'
    ]);
    
    Route::resource('invitations', InvitationController::class)->only(['index', 'update', 'destroy']);
});

require __DIR__.'/settings.php';
