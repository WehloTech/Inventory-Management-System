<?php

namespace App\Http\Controllers;
use Inertia\Inertia; // ← THIS IS REQUIRED
use Illuminate\Http\Request;
use App\Models\Product; // ← Add this line
class PageController extends Controller
{
    public function products()
    {
        return Inertia::render('Product/Products');
    }
    public function create() {
        return Inertia::render('Product/Create');
    }

    public function edit($id) {
        $product = Product::findOrFail($id);
        return Inertia::render('Product/Edit', [
            'product' => $product
        ]);
    }
}