<?php

namespace App\Http\Controllers;

use App\Models\Box;
use App\Models\Subcategory;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MasterlistController extends Controller
{
    /*
    ======================================================
    1️⃣ GET BOXES BY MAIN CATEGORY
    Columns:
    - BoxName
    - Category Quantity
    - Action(View)
    ======================================================
    */
    public function getBoxesByCategory($mainCategoryId)
    {
        $boxes = Box::where('main_category_id', $mainCategoryId)
            ->withCount('subcategories')
            ->get()
            ->map(function ($box) {
                return [
                    'id' => $box->id,
                    'box_name' => $box->name,
                    'category_quantity' => $box->subcategories_count
                ];
            });

        return response()->json($boxes);
    }

    /*
    ======================================================
    2️⃣ GET SUBCATEGORY SUMMARY PER BOX
    Columns:
    - Subcategory
    - stockin
    - stockout
    - damage
    - inuse
    - current items
    ======================================================
    */
    public function getBoxSubcategories($boxId)
    {
        $subcategories = Subcategory::where('box_id', $boxId)
            ->with(['items'])
            ->get()
            ->map(function ($sub) {

                $stockIn = $sub->items->count();
                $stockOut = $sub->items->where('status', 'STOCK_OUT')->count();
                $damage = $sub->items->where('status', 'DAMAGED')->count();
                $inUse = $sub->items->where('status', 'IN_USE')->count();
                $current = $sub->items->where('status', 'IN_STOCK')->count();

                return [
                    'subcategory_id' => $sub->id,
                    'subcategory_name' => $sub->name,
                    'stockin' => $stockIn,
                    'stockout' => $stockOut,
                    'damage' => $damage,
                    'inuse' => $inUse,
                    'current_items' => $current
                ];
            });

        return response()->json($subcategories);
    }

    /*
    ======================================================
    3️⃣ GET SERIALS PER SUBCATEGORY
    Columns:
    - serial
    - supplier
    - status
    ======================================================
    */
    public function getSubcategorySerials($subcategoryId)
    {
        $items = Item::where('subcategory_id', $subcategoryId)
            ->with('supplier')
            ->get()
            ->map(function ($item) {
                return [
                    'serial' => $item->serial_number,
                    'supplier' => $item->supplier->name ?? null,
                    'status' => $item->status
                ];
            });

        return response()->json($items);
    }
}
