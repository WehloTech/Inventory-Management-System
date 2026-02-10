<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MasterlistController;

Route::get('/masterlist/boxes/{mainCategoryId}', [MasterlistController::class, 'getBoxesByCategory']);

Route::get('/masterlist/box/{boxId}/subcategories', [MasterlistController::class, 'getBoxSubcategories']);

Route::get('/masterlist/subcategory/{subcategoryId}/serials', [MasterlistController::class, 'getSubcategorySerials']);
