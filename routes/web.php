<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\PageController;
use App\Http\Controllers\USHER\MasterListController;

Route::get('/', function () {
    return Inertia::render('LandingPage');
})->name('home');

Route::prefix('usher')->group(function () {
    Route::get('/inventory', function () {
        return Inertia::render('USHER/Inventory');
    })->name('usher.inventory');
    
    // Master list index
    Route::get('/master-list', [MasterListController::class, 'index'])->name('usher.master-list');
    
    // IMPORTANT: More specific routes MUST come BEFORE generic routes
    // Serial Number View - this must be before the {boxId} route
    Route::get('/master-list/{boxId}/item/{subcategoryId}', [MasterListController::class, 'showSerials'])
        ->name('usher.serial-number-view')
        ->where(['boxId' => '[0-9]+', 'subcategoryId' => '[0-9]+']);
    
    // Box Details View - more generic route, comes after specific routes
    Route::get('/master-list/{boxId}', [MasterListController::class, 'show'])
        ->name('usher.actionviewu')
        ->where(['boxId' => '[0-9]+']);

    Route::get('/stock-in', function () {
        return Inertia::render('USHER/StockInU');  
    })->name('usher.stock-in');
    
    Route::get('/stock-out', function () {
        return Inertia::render('USHER/StockOutU');  
    })->name('usher.stock-out');
    
    Route::get('/in-use', function () {
        return Inertia::render('USHER/InUseU');  
    })->name('usher.in-use');
    
    Route::get('/damaged', function () {
        return Inertia::render('USHER/StockDamageU');  
    })->name('usher.damaged');
    
    Route::get('/purchase-order', function () {
        return Inertia::render('USHER/PurchaseOrderU');
    })->name('usher.purchase-order');
    
    Route::get('/purchase-request', function () {
        return Inertia::render('USHER/PurchaseRequestU');
    })->name('usher.purchase-request');
    
    Route::get('/deployment', function () {
        return Inertia::render('USHER/Deployment');
    })->name('usher.deployment');
});


Route::get('/products', [PageController::class, 'products']);

// Create page
Route::get('/products/create', [PageController::class, 'create']);

// Edit page
Route::get('/products/{id}/edit', [PageController::class, 'edit']);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::get('/mock-inventory/usher-page', function () {
    return Inertia::render('MockInventory/UsherPage');
})->name('mock-inventory.usher-page');

require __DIR__.'/settings.php';