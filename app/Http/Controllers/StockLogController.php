<?php

namespace App\Http\Controllers;

use App\Models\StockLog;
use Illuminate\Http\Request;

class StockLogController extends Controller
{
    public function index()
    {
        return StockLog::with(['item.stock'])->get();
    }

    public function show($id)
    {
        return StockLog::with(['item.stock'])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $log = StockLog::create($request->all());
        return response()->json($log, 201);
    }

    public function update(Request $request, $id)
    {
        $log = StockLog::findOrFail($id);
        $log->update($request->all());
        return response()->json($log);
    }

    public function destroy($id)
    {
        $log = StockLog::findOrFail($id);
        $log->delete();
        return response()->json(null, 204);
    }

    // Optional: filter by type
    public function type($type)
    {
        return StockLog::with(['item.stock'])
            ->where('type', $type)
            ->get();
    }
}
