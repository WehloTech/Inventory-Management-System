<?php

namespace App\Http\Controllers;

use App\Models\Box;
use App\Models\Subcategory;
use App\Models\Supplier;
use App\Models\ConsumableItem;
use App\Models\ConsumableLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConsumableController extends Controller
{
    private function getCategoryIds(int $mainCategoryId): array
    {
        if ($mainCategoryId === 5) {
            return [1, 2, 4];
        }
        return [$mainCategoryId];
    }

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
    1️⃣ GET ALL CONSUMABLE ITEMS BY MAIN CATEGORY
    Returns all rows: item name, box, quantity, supplier
    ======================================================
    */
    public function getConsumables($mainCategoryId)
    {
        try {
            $categoryIds = $this->getCategoryIds((int) $mainCategoryId);

            $items = ConsumableItem::with(['box', 'subcategory', 'supplier'])
                ->whereHas('box', function ($query) use ($categoryIds) {
                    $query->whereIn('main_category_id', $categoryIds);
                })
                ->get()
                ->map(function ($item) {
                    return [
                        'id'            => $item->id,
                        'item_name'     => $item->subcategory->name,
                        'box_name'      => $item->box->name,
                        'box_id'        => $item->box_id,
                        'subcategory_id'=> $item->subcategory_id,
                        'supplier_name' => $item->supplier?->name ?? 'N/A',
                        'supplier_id'   => $item->supplier_id,
                        'quantity'      => $item->quantity,
                        'main_category' => $this->getCategoryName($item->box->main_category_id),
                        'updated_at'    => $item->updated_at->toIso8601String(),
                    ];
                });

            return response()->json($items);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch consumables', 'error' => $e->getMessage()], 500);
        }
    }

    /*
    ======================================================
    2️⃣ ADD CONSUMABLE ITEM (or add quantity to existing)
    Body: boxId, itemName, quantity, supplierId, remarks
    ======================================================
    */
    public function addConsumable(Request $request)
    {
        $request->validate([
            'boxId'      => 'required|exists:boxes,id',
            'itemName'   => 'required|string|max:255',
            'quantity'   => 'required|integer|min:1',
            'supplierId' => 'nullable|exists:suppliers,id',
            'remarks'    => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            // Find or create subcategory by name
            $subcategory = Subcategory::firstOrCreate(['name' => $request->itemName]);

            // Find or create consumable item (unique per box + subcategory)
            $consumableItem = ConsumableItem::firstOrCreate(
                [
                    'box_id'         => $request->boxId,
                    'subcategory_id' => $subcategory->id,
                ],
                [
                    'supplier_id' => $request->supplierId,
                    'quantity'    => 0,
                ]
            );

            // Update supplier if provided
            if ($request->supplierId) {
                $consumableItem->supplier_id = $request->supplierId;
            }

            // Increment quantity
            $consumableItem->quantity += $request->quantity;
            $consumableItem->save();

            // Log the action
            ConsumableLog::create([
                'consumable_item_id' => $consumableItem->id,
                'action_type'        => 'ADD',
                'quantity'           => $request->quantity,
                'remarks'            => $request->remarks,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Consumable added successfully',
                'data'    => $consumableItem->load(['box', 'subcategory', 'supplier']),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to add consumable', 'error' => $e->getMessage()], 500);
        }
    }

    /*
    ======================================================
    3️⃣ DEDUCT CONSUMABLE QUANTITY
    Body: consumableItemId, quantity, remarks
    ======================================================
    */
    public function deductConsumable(Request $request)
    {
        $request->validate([
            'consumableItemId' => 'required|exists:consumable_items,id',
            'quantity'         => 'required|integer|min:1',
            'remarks'          => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $consumableItem = ConsumableItem::findOrFail($request->consumableItemId);

            // Check if enough stock
            if ($consumableItem->quantity < $request->quantity) {
                return response()->json([
                    'message' => "Insufficient quantity. Available: {$consumableItem->quantity}",
                ], 422);
            }

            // Deduct quantity
            $consumableItem->quantity -= $request->quantity;
            $consumableItem->save();

            // Log the action
            ConsumableLog::create([
                'consumable_item_id' => $consumableItem->id,
                'action_type'        => 'DEDUCT',
                'quantity'           => $request->quantity,
                'remarks'            => $request->remarks,
            ]);

            DB::commit();

            return response()->json([
                'message'      => 'Quantity deducted successfully',
                'new_quantity' => $consumableItem->quantity,
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to deduct consumable', 'error' => $e->getMessage()], 500);
        }
    }

    /*
    ======================================================
    4️⃣ DELETE CONSUMABLE ITEM ROW
    ======================================================
    */
    public function deleteConsumable($id)
    {
        try {
            $item = ConsumableItem::findOrFail($id);

            // Logs cascade delete via migration
            $item->delete();

            return response()->json(['message' => 'Consumable item deleted successfully'], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Consumable item not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete consumable', 'error' => $e->getMessage()], 500);
        }
    }

    /*
    ======================================================
    5️⃣ GET LOGS FOR A SPECIFIC CONSUMABLE ITEM
    ======================================================
    */
    public function getConsumableLogs($consumableItemId)
    {
        try {
            $logs = ConsumableLog::where('consumable_item_id', $consumableItemId)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($log) {
                    return [
                        'id'          => $log->id,
                        'action_type' => $log->action_type,
                        'quantity'    => $log->quantity,
                        'remarks'     => $log->remarks,
                        'date'        => $log->created_at->toIso8601String(),
                    ];
                });

            return response()->json($logs);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch logs', 'error' => $e->getMessage()], 500);
        }
    }

    /*
    ======================================================
    6️⃣ UPDATE REMARKS FOR A CONSUMABLE LOG
    ======================================================
    */
    public function updateConsumableRemarks(Request $request)
    {
        $request->validate([
            'logId'   => 'required|exists:consumable_logs,id',
            'remarks' => 'required|string',
        ]);

        try {
            $log = ConsumableLog::findOrFail($request->logId);
            $log->remarks = $request->remarks;
            $log->save();

            return response()->json(['message' => 'Remarks updated successfully'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update remarks', 'error' => $e->getMessage()], 500);
        }
    }
}