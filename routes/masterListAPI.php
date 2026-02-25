<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MasterlistController;
use App\Http\Controllers\StockInController;
use App\Http\Controllers\PasscodeController; 
use App\Http\Controllers\ConsumableController;

// ==============================
// MASTERLIST API
// ==============================

// Get boxes by main category
Route::get('/masterlist/boxes/{mainCategoryId}', [MasterlistController::class, 'getBoxesByCategory']);

// Get subcategory summary per box
Route::get('/masterlist/box/{boxId}/subcategories', [MasterlistController::class, 'getBoxSubcategories']);

// Get serials per subcategory
Route::get('/masterlist/subcategory/{subcategoryId}/box/{boxId}/serials', [MasterlistController::class, 'getSubcategorySerials']);

// Add new box
Route::post('/masterlist/box', [MasterlistController::class, 'addBox']);

// Delete box
Route::delete('/masterlist/box/{boxId}', [MasterlistController::class, 'deleteBox']);


// ==============================
// STOCK IN API
// ==============================

// Get all suppliers
Route::get('/stockin/suppliers', [StockInController::class, 'getSuppliers']);

// Get existing item names (subcategories) by main category
Route::get('/stockin/items/{mainCategoryId}', [StockInController::class, 'getExistingItems']);

// Get all existing serial numbers
Route::get('/stockin/serials', [StockInController::class, 'getAllSerials']);

// Add new supplier
Route::post('/stockin/supplier', [StockInController::class, 'addSupplier']);

// Batch stock in (multiple items)
Route::post('/stockin/batch', [StockInController::class, 'batchStockIn']);

// Get stock in dashboard data
Route::get('/stockin/dashboard/{mainCategoryId}', [StockInController::class, 'getStockInDashboard']);

// Move items (change status)
Route::post('/stockin/move', [StockInController::class, 'moveItems']);

// Update remarks
Route::post('/stockin/update-remarks', [StockInController::class, 'updateRemarks']);

// Delete stock in entry
Route::delete('/stockin/entry', [StockInController::class, 'deleteStockInEntry']);

// Get items available for move (in stock)
Route::get('/stockin/items-for-move/{mainCategoryId}', [StockInController::class, 'getItemsForMove']);


// ==============================
// STOCK OUT API 
// ==============================

Route::get('/stockout/dashboard/{mainCategoryId}', [StockInController::class, 'getStockOutDashboard']);

Route::get('/stockin/subcategory-boxes/{subcategoryName}/{mainCategoryId}', [StockInController::class, 'getBoxesForSubcategory']);


// ==============================
// IN USE API
// ==============================

// Get in-use dashboard data
Route::get('/inuse/dashboard/{mainCategoryId}', [StockInController::class, 'getInUseDashboard']);

// Update remarks for an in-use entry
Route::post('/inuse/update-remarks', [StockInController::class, 'updateInUseRemarks']);


// ==============================
// STOCK DAMAGE API
// ==============================

// Get stock damage dashboard data
Route::get('/stockdamage/dashboard/{mainCategoryId}', [StockInController::class, 'getStockDamageDashboard']);

// Update remarks for a stock damage entry
Route::post('/stockdamage/update-remarks', [StockInController::class, 'updateDamageRemarks']);




// ==============================
// PASSCODE API
// ==============================

Route::post('/passcode/verify', [PasscodeController::class, 'verify']);        // 👈 add this
Route::post('/passcode/forgot', [PasscodeController::class, 'sendResetCode']);
Route::post('/passcode/verify-otp', [PasscodeController::class, 'verifyOtp']);
Route::post('/passcode/reset', [PasscodeController::class, 'resetPasscode']);




// ==============================
// CONSUMABLES API
// ==============================

// Get all consumable items by main category
Route::get('/consumable/items/{mainCategoryId}', [ConsumableController::class, 'getConsumables']);

// Add new consumable item (or add quantity to existing)
Route::post('/consumable/add', [ConsumableController::class, 'addConsumable']);

// Deduct quantity from a consumable item
Route::post('/consumable/deduct', [ConsumableController::class, 'deductConsumable']);

// Delete a consumable item row
Route::delete('/consumable/item/{id}', [ConsumableController::class, 'deleteConsumable']);

// Get logs for a specific consumable item
Route::get('/consumable/logs/{consumableItemId}', [ConsumableController::class, 'getConsumableLogs']);

// Update remarks for a consumable log
Route::post('/consumable/update-remarks', [ConsumableController::class, 'updateConsumableRemarks']);



// ==============================
// LOG HISTORY API
// ==============================
Route::get('/log-history/{mainCategoryId}', [StockInController::class, 'getLogHistory']);

