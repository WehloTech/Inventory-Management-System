<?php

namespace App\Http\Controllers;
use Inertia\Inertia; // ← THIS IS REQUIRED
use Illuminate\Http\Request;

class PageController extends Controller
{
    public function products()
    {
        return Inertia::render('Products');
    }
}