<?php

namespace App\Http\Controllers;

use App\Models\Box;
use App\Models\Subcategory;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MasterlistController extends Controller
{
    // NEW HELPER
    private function getCategoryIds(int $mainCategoryId): array
    {
        if ($mainCategoryId === 5) {
            return [1, 2, 4];
        }
        return [$mainCategoryId];
    }

    // NEW HELPER
    private function getCategoryName(int $mainCategoryId): string
    {
        return match($mainCategoryId) {
            1 => 'Usher',
            2 => 'Usherette',
            3 => 'Wehlo',
            4 => 'Hoclomac',
            default => 'Unknown',
        };
    }

    /*
    ======================================================
    GET BOXES BY MAIN CATEGORY
    Columns:
    - BoxName
    - Category Quantity
    - Action(View)
    ======================================================
    */
public function getBoxesByCategory($mainCategoryId)
{
    $categoryIds = $this->getCategoryIds((int) $mainCategoryId);
    $search = request()->query('search', '');

    $boxes = Box::whereIn('main_category_id', $categoryIds)->get()->map(function ($box) {
        $categoryQty = Item::where('box_id', $box->id)
            ->distinct('subcategory_id')
            ->count('subcategory_id');

        // Get item/subcategory names inside this box
        $itemNames = Item::where('box_id', $box->id)
            ->with('subcategory')
            ->get()
            ->pluck('subcategory.name')
            ->unique()
            ->filter()
            ->values()
            ->toArray();

        return [
            'id'                => $box->id,
            'box_name'          => $box->name,
            'category_quantity' => $categoryQty,
            'main_category'     => $this->getCategoryName($box->main_category_id),
            'item_names'        => $itemNames, // ← new field
        ];
    });

    // Filter by search if provided
    if ($search) {
        $search = strtolower($search);
        $boxes = $boxes->filter(function ($box) use ($search) {
            // Match box name
            if (str_contains(strtolower($box['box_name']), $search)) return true;
            // Match any item name inside the box
            foreach ($box['item_names'] as $itemName) {
                if (str_contains(strtolower($itemName), $search)) return true;
            }
            return false;
        })->values();
    }

    return response()->json($boxes);
}

/*
======================================================
GET SUBCATEGORY SUMMARY PER BOX
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
        $box = Box::findOrFail($boxId); // ✅ NEW - needed for main_category_id

        $items = Item::where('box_id', $boxId)
            ->with('subcategory')
            ->get();

        $grouped = $items->groupBy('subcategory_id');

        $subcategories = $grouped->map(function ($groupItems, $subcategoryId) use ($box) {
            $sub = $groupItems->first()->subcategory;

            return [
                'subcategory_id'   => $subcategoryId,
                'subcategory_name' => $sub->name,
                'main_category'    => $this->getCategoryName($box->main_category_id), // ✅ NEW
                'stockin'          => $groupItems->count(),
                'stockout'         => $groupItems->where('status', 'STOCK_OUT')->count(),
                'damage'           => $groupItems->where('status', 'DAMAGED')->count(),
                'inuse'            => $groupItems->where('status', 'IN_USE')->count(),
                'current_items'    => $groupItems->where('status', 'IN_STOCK')->count(),
            ];
        })->values();

        return response()->json($subcategories);
    }

    /*
    ======================================================
    GET SERIALS PER SUBCATEGORY
    Columns:
    - serial
    - supplier
    - status
    ======================================================
    */
    public function getSubcategorySerials($subcategoryId, $boxId)
    {
        $items = Item::where('subcategory_id', $subcategoryId)
            ->where('box_id', $boxId)
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

        /*
    ======================================================
    ADD BOX
    Body:
    - name
    - main_category_id
    ======================================================
    */
    public function addBox(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'main_category_id' => 'required|exists:main_categories,id'
        ]);

        // Check if box with same name already exists in this category
        $exists = Box::where('name', $request->name)
                    ->where('main_category_id', $request->main_category_id)
                    ->exists();
        
        if ($exists) {
            return response()->json([
                'message' => 'Box ID already has been taken'
            ], 422); // 422 Unprocessable Entity
        }

        $box = Box::create([
            'name' => $request->name,
            'main_category_id' => $request->main_category_id
        ]);

        return response()->json([
            'message' => 'Box created successfully',
            'data' => $box
        ], 201);
    }
   /*
    ======================================================
    DELETE BOX
    Deletes a box and all associated subcategories and items
    ======================================================
    */
    public function deleteBox($boxId)
    {
        try {
            $box = Box::findOrFail($boxId);
            
            // Just delete the box - cascade will handle the rest!
            $box->delete();

            return response()->json([
                'message' => 'Box deleted successfully'
            ], 200);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Box not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete box',
                'error' => $e->getMessage()
            ], 500);
        }
    }


 
}
