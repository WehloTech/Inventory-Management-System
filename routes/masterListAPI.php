<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MasterlistController;
use App\Http\Controllers\StockInController;

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

