<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\PageController;

Route::get('/', function () {
    return Inertia::render('LandingPage');
})->name('home');

// USHER Routes
Route::prefix('usher')->group(function () {
    Route::get('/inventory', function () {
        return Inertia::render('USHER/Inventory');
    })->name('usher.inventory');
    
    Route::get('/master-list', function () {
        return Inertia::render('USHER/MasterList');
    })->name('usher.master-list');

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

require __DIR__.'/settings.php';