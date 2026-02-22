<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    public function index()
    {
        return Item::with(['stock', 'stockLogs'])->get();
    }

    public function show($id)
    {
        return Item::with(['stock', 'stockLogs'])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $item = Item::create($request->all());

        // Optional: create initial stock log
        // $item->stockLogs()->create([
        //     'type' => 'IN',
        //     'quantity' => $request->quantity ?? 0,
        //     'date' => now(),
        //     'notes' => 'Initial stock'
        // ]);

        return response()->json($item, 201);
    }

    public function update(Request $request, $id)
    {
        $item = Item::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id)
    {
        $item = Item::findOrFail($id);
        $item->delete();
        return response()->json(null, 204);
    }

    // Get all stock logs of an item
    public function stockLogs($id)
    {
        $item = Item::with('stockLogs')->findOrFail($id);
        return $item->stockLogs;
    }
}
