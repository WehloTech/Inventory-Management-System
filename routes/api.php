<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PageController;

Route::get('/ping', function () {
    return response()->json(['message' => 'API works']);
});

Route::get('/users', [UserController::class,'index']);

Route::apiResource('products', ProductController::class);
*/
// Add the new Masterlist API routes
require __DIR__.'/masterlistAPI.php';

// Add the new Masterlist API routes
require __DIR__.'/inventoryAPI.php';
