<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\Request;

class StockController extends Controller
{
    // GET /stocks
    public function index()
    {
        return Stock::all();
    }

    // GET /stocks/{id}
    public function show($id)
    {
        return Stock::with(['items', 'suppliers'])->findOrFail($id);
    }

    // POST /stocks
    public function store(Request $request)
    {
        $stock = Stock::create($request->all());
        return response()->json($stock, 201);
    }

    // PUT/PATCH /stocks/{id}
    public function update(Request $request, $id)
    {
        $stock = Stock::findOrFail($id);
        $stock->update($request->all());
        return response()->json($stock);
    }

    // DELETE /stocks/{id}
    public function destroy($id)
    {
        $stock = Stock::findOrFail($id);
        $stock->delete();
        return response()->json(null, 204);
    }
}
