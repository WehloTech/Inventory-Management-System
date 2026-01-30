<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StockController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\StockLogController;

Route::apiResource('stocks', StockController::class);
Route::apiResource('items', ItemController::class);
Route::apiResource('suppliers', SupplierController::class);
Route::apiResource('stock-logs', StockLogController::class);

// Custom relationship queries
Route::get('items/{id}/stock-logs', [ItemController::class, 'stockLogs']);
Route::get('stock-logs/type/{type}', [StockLogController::class, 'type']);

