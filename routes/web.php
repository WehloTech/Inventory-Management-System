<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\USHER\MasterListController;
use App\Http\Controllers\PasscodeController;

// ── Public route ──
Route::get('/login', function () {
    return Inertia::render('Login');
})->name('login');

// ── Auth routes (must be web, not api, to use sessions) ──
Route::post('/auth/login',  [PasscodeController::class, 'login']);
Route::post('/auth/logout', [PasscodeController::class, 'logout']);
Route::get('/auth/check',   [PasscodeController::class, 'checkSession']);

// ── All protected routes ──
Route::middleware('admin.auth')->group(function () {

    Route::get('/', function () {
        return Inertia::render('LandingPage');
    })->name('home');

    Route::prefix('inventory/{system}')->group(function () {

        Route::get('/inventory', function ($system) {
            $categoryMap = ['usher' => 1, 'usherette' => 2, 'wehlo' => 3, 'hoclomac' => 4, 'shared' => 5];
            return Inertia::render('Inventory/Inventory', [
                'mainCategoryId' => $categoryMap[$system] ?? 1,
                'system' => $system,
            ]);
        })->name('inventory.home')->where('system', 'usher|usherette|wehlo|hoclomac|shared');

        Route::get('/master-list', [MasterListController::class, 'index'])
            ->name('inventory.master-list')
            ->where('system', 'usher|usherette|wehlo|hoclomac|shared');

        Route::get('/master-list/box/{boxId}/item/{subcategoryId}', [MasterListController::class, 'showSerials'])
            ->name('inventory.serial-number-view')
            ->where([
                'system' => 'usher|usherette|wehlo|hoclomac|shared',
                'boxId' => '[0-9]+',
                'subcategoryId' => '[0-9]+'
            ]);

        Route::get('/master-list/box/{boxId}', [MasterListController::class, 'show'])
            ->name('inventory.actionview')
            ->where([
                'system' => 'usher|usherette|wehlo|hoclomac|shared',
                'boxId' => '[0-9]+'
            ]);

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

        Route::get('/consumable', function ($system) {
            $categoryMap = ['usher' => 1, 'usherette' => 2, 'wehlo' => 3, 'hoclomac' => 4, 'shared' => 5];
            return Inertia::render('Inventory/Consumable', [
                'mainCategoryId' => $categoryMap[$system] ?? 1,
                'system' => $system,
            ]);
        })->name('inventory.consumable')->where('system', 'usher|usherette|wehlo|hoclomac|shared');

        Route::get('/log-history', function ($system) {
            $categoryMap = ['usher' => 1, 'usherette' => 2, 'wehlo' => 3, 'hoclomac' => 4, 'shared' => 5];
            return Inertia::render('Inventory/LogHistory', [
                'mainCategoryId' => $categoryMap[$system] ?? 1,
                'system' => $system,
            ]);
        })->name('inventory.log-history')->where('system', 'usher|usherette|wehlo|hoclomac|shared');

    });
});