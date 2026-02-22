<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\USHER\MasterListController;

Route::get('/', function () {
    return Inertia::render('LandingPage');
})->name('home');

// Inventory routes with system parameter
Route::prefix('inventory/{system}')->group(function () {
    // Inventory Home
    Route::get('/inventory', function ($system) {
        $categoryMap = ['usher' => 1, 'usherette' => 2, 'wehlo' => 3, 'hoclomac' => 4, 'shared' => 5];
        return Inertia::render('Inventory/Inventory', [
            'mainCategoryId' => $categoryMap[$system] ?? 1,
            'system' => $system,
        ]);
    })->name('inventory.home')->where('system', 'usher|usherette|wehlo|hoclomac|shared');
    // Master list - shows shared boxes
    Route::get('/master-list', [MasterListController::class, 'index'])
        ->name('inventory.master-list')
        ->where('system', 'usher|usherette|wehlo|hoclomac|shared');
    
    // Serial Number View - MUST come before the box route (more specific)
    Route::get('/master-list/box/{boxId}/item/{subcategoryId}', [MasterListController::class, 'showSerials'])
        ->name('inventory.serial-number-view')
        ->where([
            'system' => 'usher|usherette|wehlo|hoclomac|shared',
            'boxId' => '[0-9]+',
            'subcategoryId' => '[0-9]+'
        ]);
    
    // Box Details View - shows subcategories for a box
    Route::get('/master-list/box/{boxId}', [MasterListController::class, 'show'])
        ->name('inventory.actionview')
        ->where([
            'system' => 'usher|usherette|wehlo|hoclomac|shared',
            'boxId' => '[0-9]+'
        ]);

    // Other inventory routes
    Route::get('/stock-in', function ($system) {
        $categoryMap = ['usher' => 1, 'usherette' => 2, 'wehlo' => 3, 'hoclomac' => 4, 'shared' => 5];
        return Inertia::render('Inventory/StockInU', [
            'mainCategoryId' => $categoryMap[$system] ?? 1,
            'system' => $system,
        ]);
    })->name('inventory.stock-in')->where('system', 'usher|usherette|wehlo|hoclomac|shared');
    
    Route::get('/stock-out', function ($system) {
        $categoryMap = ['usher' => 1, 'usherette' => 2, 'wehlo' => 3, 'hoclomac' => 4, 'shared' => 5];
        return Inertia::render('Inventory/StockOutU', [
            'mainCategoryId' => $categoryMap[$system] ?? 1,
            'system' => $system,
        ]);
    })->name('inventory.stock-out')->where('system', 'usher|usherette|wehlo|hoclomac|shared');
    
    Route::get('/in-use', function ($system) {
        $categoryMap = ['usher' => 1, 'usherette' => 2, 'wehlo' => 3, 'hoclomac' => 4, 'shared' => 5];
        return Inertia::render('Inventory/InUseU', [
            'mainCategoryId' => $categoryMap[$system] ?? 1,
            'system' => $system,
        ]);
    })->name('inventory.in-use')->where('system', 'usher|usherette|wehlo|hoclomac|shared');
    
    Route::get('/damaged', function ($system) {
        $categoryMap = ['usher' => 1, 'usherette' => 2, 'wehlo' => 3, 'hoclomac' => 4, 'shared' => 5];
        return Inertia::render('Inventory/StockDamageU', [
            'mainCategoryId' => $categoryMap[$system] ?? 1,
            'system' => $system,
        ]);
    })->name('inventory.damaged')->where('system', 'usher|usherette|wehlo|hoclomac|shared');
    
    Route::get('/purchase-order', function ($system) {
        $categoryMap = ['usher' => 1, 'usherette' => 2, 'wehlo' => 3, 'hoclomac' => 4, 'shared' => 5];
        return Inertia::render('Inventory/PurchaseOrderU', [
            'mainCategoryId' => $categoryMap[$system] ?? 1,
            'system' => $system,
        ]);
    })->name('inventory.purchase-order')->where('system', 'usher|usherette|wehlo|hoclomac|shared');
    
    Route::get('/purchase-request', function ($system) {
        $categoryMap = ['usher' => 1, 'usherette' => 2, 'wehlo' => 3, 'hoclomac' => 4, 'shared' => 5];
        return Inertia::render('Inventory/PurchaseRequestU', [
            'mainCategoryId' => $categoryMap[$system] ?? 1,
            'system' => $system,
        ]);
    })->name('inventory.purchase-request')->where('system', 'usher|usherette|wehlo|hoclomac|shared');
    
    Route::get('/deployment', function ($system) {
        $categoryMap = ['usher' => 1, 'usherette' => 2, 'wehlo' => 3, 'hoclomac' => 4, 'shared' => 5];
        return Inertia::render('Inventory/Deployment', [
            'mainCategoryId' => $categoryMap[$system] ?? 1,
            'system' => $system,
        ]);
    })->name('inventory.deployment')->where('system', 'usher|usherette|wehlo|hoclomac|shared');
});