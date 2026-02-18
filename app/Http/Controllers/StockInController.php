<?php

namespace App\Http\Controllers;

use App\Models\Box;
use App\Models\Subcategory;
use App\Models\Item;
use App\Models\Supplier;
use App\Models\StockLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StockInController extends Controller
{
    /*
    ======================================================
    1️⃣ GET ALL SUPPLIERS
    ======================================================
    */
    public function getSuppliers()
    {
        try {
            $suppliers = Supplier::all()->map(function ($supplier) {
                return [
                    'id' => (string) $supplier->id,
                    'name' => $supplier->name,
                    'email' => $supplier->email ?? '',
                    'contact' => $supplier->contact_number ?? '',
                ];
            });

            return response()->json($suppliers);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch suppliers',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /*
    ======================================================
    2️⃣ GET EXISTING ITEM NAMES (SUBCATEGORIES) BY MAIN CATEGORY
    ======================================================
    */
    public function getExistingItems($mainCategoryId)
    {
        try {
            $items = Subcategory::whereHas('items.box', function ($query) use ($mainCategoryId) {
                $query->where('main_category_id', $mainCategoryId);
            })
            ->pluck('name')
            ->toArray();

            return response()->json($items);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch items',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /*
    ======================================================
    3️⃣ GET ALL EXISTING SERIAL NUMBERS
    ======================================================
    */
    public function getAllSerials()
    {
        try {
            $serials = Item::pluck('serial_number')->toArray();
            return response()->json($serials);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch serials',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /*
    ======================================================
    4️⃣ ADD SUPPLIER
    ======================================================
    */
    public function addSupplier(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email',
                'contact' => 'required|string',
            ]);

            $supplier = Supplier::create([
                'name' => $request->name,
                'email' => $request->email,
                'contact_number' => $request->contact, // Database column is contact_number
            ]);

            return response()->json([
                'message' => 'Supplier created successfully',
                'data' => $supplier,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create supplier',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /*
    ======================================================
    5️⃣ BATCH STOCK IN (Submit Multiple Items)
    ======================================================
    */
    public function batchStockIn(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.boxId' => 'required|exists:boxes,id',
            'items.*.itemName' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.remarks' => 'nullable|string',
            'items.*.serialGroups' => 'required|array|min:1',
            'items.*.serialGroups.*.serialNumbers' => 'required|array|min:1',
            'items.*.serialGroups.*.supplierId' => 'required|exists:suppliers,id',
        ]);

        try {
            DB::beginTransaction();

            $results = [];

            foreach ($request->items as $itemData) {
                // Find or create subcategory (itemName = subcategory name)
                $box = Box::findOrFail($itemData['boxId']);

                // AFTER
                $subcategory = Subcategory::firstOrCreate([
                    'name' => $itemData['itemName'],
                ]);

                $createdItems = [];

                // Create items for each serial number group
                foreach ($itemData['serialGroups'] as $group) {
                    foreach ($group['serialNumbers'] as $serialNumber) {
                        // Check if serial number already exists
                        if (Item::where('serial_number', $serialNumber)->exists()) {
                            DB::rollBack();
                            return response()->json([
                                'message' => "Serial number {$serialNumber} already exists",
                            ], 422);
                        }

                        // Create item
                        $item = Item::create([
                            'subcategory_id' => $subcategory->id,
                            'box_id' => $box->id,
                            'supplier_id' => $group['supplierId'],
                            'serial_number' => $serialNumber,
                            'status' => 'IN_STOCK',
                        ]);

                        // Create stock log
                        StockLog::create([
                            'item_id' => $item->id,
                            'action_type' => 'STOCK_IN',
                            'remarks' => $itemData['remarks'] ?? null,
                        ]);

                        $createdItems[] = $item;
                    }
                }

                $results[] = [
                    'boxName' => $box->name,
                    'itemName' => $subcategory->name,
                    'quantity' => count($createdItems),
                    'items' => $createdItems,
                ];
            }

            DB::commit();

            return response()->json([
                'message' => 'Stock in successful',
                'data' => $results,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Stock in failed',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /*
    ======================================================
    6️⃣ GET STOCK IN DASHBOARD DATA
    ======================================================
    */
    public function getStockInDashboard($mainCategoryId)
    {
        try {
            $stockInLogs = StockLog::with(['item.subcategory', 'item.box', 'item.supplier'])
                ->where('action_type', 'STOCK_IN')
                ->whereHas('item.box', function ($query) use ($mainCategoryId) {
                    $query->where('main_category_id', $mainCategoryId);
                })
                ->get();

            $grouped = $stockInLogs->groupBy(function ($log) {
                $date = $log->created_at ? $log->created_at->format('Y-m-d') : now()->format('Y-m-d');
                return $log->item->subcategory->name . '|' . $date;
            });

            $dashboard = [];

            foreach ($grouped as $key => $logs) {
                [$itemName, $date] = explode('|', $key);

                $serialGroups = [];
                $bySupplier = $logs->groupBy(fn($log) => $log->item->supplier_id);

                foreach ($bySupplier as $supplierId => $supplierLogs) {
                    $supplier = $supplierLogs->first()->item->supplier;
                    $serialGroups[] = [
                        'serialNumbers' => $supplierLogs->map(fn($log) => [
                            'serial' => $log->item->serial_number,
                            'boxName' => $log->item->box->name,
                        ])->toArray(),
                        'supplierId' => (string) $supplierId,
                        'supplierName' => $supplier ? $supplier->name : 'Unknown',
                    ];
                }

                $dashboard[] = [
                    'id' => 'entry-' . md5($key),
                    'boxName' => '', // no longer a single box
                    'itemName' => $itemName,
                    'date' => $date,
                    'totalQuantity' => $logs->count(),
                    'serialGroups' => $serialGroups,
                    'remarks' => $logs->first()->remarks ?? '',
                ];
            }

            return response()->json($dashboard);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch dashboard',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /*
    ======================================================
    7️⃣ MOVE ITEMS (Change Status)
    ======================================================
    */
    public function moveItems(Request $request)
    {
        $request->validate([
            'serialNumbers' => 'required|array|min:1',
            'serialNumbers.*' => 'required|string|exists:items,serial_number',
            'status' => 'required|in:IN_USE,STOCK_OUT,DAMAGED',
            'remarks' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $movedItems = [];

            foreach ($request->serialNumbers as $serialNumber) {
                $item = Item::where('serial_number', $serialNumber)->first();
                
                if (!$item) {
                    continue;
                }

                // Update item status
                $item->status = $request->status;
                $item->save();

                // Create stock log
                StockLog::create([
                    'item_id' => $item->id,
                    'action_type' => $request->status,
                    'remarks' => $request->remarks,
                ]);

                $movedItems[] = $item;
            }

            DB::commit();

            return response()->json([
                'message' => 'Items moved successfully',
                'data' => [
                    'count' => count($movedItems),
                    'status' => $request->status,
                ],
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to move items',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /*
    ======================================================
    8️⃣ UPDATE REMARKS FOR STOCK IN ENTRY
    ======================================================
    */
    public function updateRemarks(Request $request)
    {
        $request->validate([
            'serialNumbers' => 'required|array|min:1',
            'serialNumbers.*' => 'required|string|exists:items,serial_number',
            'remarks' => 'required|string',
        ]);

        try {
            $items = Item::whereIn('serial_number', $request->serialNumbers)->get();

            foreach ($items as $item) {
                // Update the latest STOCK_IN log for this item
                $latestLog = StockLog::where('item_id', $item->id)
                    ->where('action_type', 'STOCK_IN')
                    ->latest()
                    ->first();

                if ($latestLog) {
                    $latestLog->remarks = $request->remarks;
                    $latestLog->save();
                }
            }

            return response()->json([
                'message' => 'Remarks updated successfully',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update remarks',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
       /*
    ======================================================
    9️⃣ DELETE STOCK IN ENTRY
    ======================================================
    */
    public function deleteStockInEntry(Request $request)
    {
        $request->validate([
            'serialNumbers' => 'required|array|min:1',
            'serialNumbers.*' => 'required|string|exists:items,serial_number',
        ]);

        try {
            DB::beginTransaction();

            $deletedCount = 0;

            foreach ($request->serialNumbers as $serialNumber) {
                $item = Item::where('serial_number', $serialNumber)->first();
                
                if ($item) {
                    // Delete associated stock logs first
                    StockLog::where('item_id', $item->id)->delete();
                    
                    // Delete the item
                    $item->delete();
                    $deletedCount++;
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Stock in entry deleted successfully',
                'deleted_count' => $deletedCount,
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete stock in entry',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    /*
    /*
    ======================================================
    🔟 GET ALL ITEMS BY SUBCATEGORY FOR MOVE MODAL
    ======================================================
    */
    public function getItemsForMove($mainCategoryId, Request $request)
    {
        try {
            $status = $request->query('status');

            $subcategories = Subcategory::whereHas('items.box', function ($query) use ($mainCategoryId) {
                $query->where('main_category_id', $mainCategoryId);
            })->get();

            $result = [];

            foreach ($subcategories as $subcategory) {
                $itemsQuery = Item::with(['supplier', 'box'])
                    ->where('subcategory_id', $subcategory->id)
                    ->whereHas('box', function ($query) use ($mainCategoryId) {
                        $query->where('main_category_id', $mainCategoryId);
                    });

                if ($status) {
                    $itemsQuery->where('status', $status);
                }

                $items = $itemsQuery->get();

                $serialGroups = [];
                $bySupplier = $items->groupBy('supplier_id');

                foreach ($bySupplier as $supplierId => $supplierItems) {
                    $supplier = $supplierItems->first()->supplier;
                    $serialGroups[] = [
                        'serialNumbers' => $supplierItems->map(fn($item) => [
                            'serial' => $item->serial_number,
                            'boxName' => $item->box->name,
                        ])->toArray(),
                        'supplierId' => (string) $supplierId,
                        'supplierName' => $supplier ? $supplier->name : 'Unknown',
                    ];
                }

                $result[] = [
                    'id' => 'item-' . md5($subcategory->name),
                    'itemName' => $subcategory->name,
                    'totalQuantity' => $items->count(),
                    'serialGroups' => $serialGroups,
                ];
            }

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch items',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}