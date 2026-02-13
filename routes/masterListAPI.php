<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MasterlistController;

// ==============================
// MASTERLIST API
// ==============================

// Get boxes by main category
Route::get('/masterlist/boxes/{mainCategoryId}', [MasterlistController::class, 'getBoxesByCategory']);

// Get subcategory summary per box
Route::get('/masterlist/box/{boxId}/subcategories', [MasterlistController::class, 'getBoxSubcategories']);

// Get serials per subcategory
Route::get('/masterlist/subcategory/{subcategoryId}/serials', [MasterlistController::class, 'getSubcategorySerials']);

// Add new box
Route::post('/masterlist/box', [MasterlistController::class, 'addBox']);