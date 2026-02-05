<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MasterlistController;

// Usher Stocks API
Route::get('/usher-stocks', [MasterlistController::class, 'usherStocks']);