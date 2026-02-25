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
            $categoryIds = $this->getCategoryIds((int) $mainCategoryId);

            $items = Subcategory::whereHas('items.box', function ($query) use ($categoryIds) {
                $query->whereIn('main_category_id', $categoryIds); // CHANGED
            })
            ->pluck('name')
            ->toArray();

            return response()->json($items);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch items', 'error' => $e->getMessage()], 500);
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
                            'item_id'     => $item->id,
                            'from_status' => null,            // brand new item, no previous state
                            'action_type' => 'STOCK_IN',
                            'remarks'     => $itemData['remarks'] ?? null,
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
            $categoryIds = $this->getCategoryIds((int) $mainCategoryId); // ✅ NEW

            $stockInLogs = StockLog::with(['item.subcategory', 'item.box', 'item.supplier'])
                ->where('action_type', 'STOCK_IN')
                ->whereHas('item.box', function ($query) use ($categoryIds) {
                    $query->whereIn('main_category_id', $categoryIds); // ✅ CHANGED
                })
                ->get();

            $grouped = $stockInLogs->groupBy(function ($log) {
                $date = $log->created_at ? $log->created_at->format('Y-m-d') : now()->format('Y-m-d');
                // ✅ ADDED main_category_id to group key
                return $log->item->subcategory->name . '|' . $date . '|' . $log->item->box->main_category_id;
            });

            $dashboard = [];

            foreach ($grouped as $key => $logs) {
                [$itemName, $date, $catId] = explode('|', $key); // ✅ UPDATED

                $serialGroups = [];
                $bySupplier = $logs->groupBy(fn($log) => $log->item->supplier_id);

                foreach ($bySupplier as $supplierId => $supplierLogs) {
                    $supplier = $supplierLogs->first()->item->supplier;
                    $serialGroups[] = [
                        'serialNumbers' => $supplierLogs->map(fn($log) => [
                            'serial'    => $log->item->serial_number,
                            'boxName'   => $log->item->box->name,
                            'batchTime' => $log->created_at->toIso8601String(),
                            'fromStatus' => $log->from_status ?? null, 
                        ])->toArray(),
                        'supplierId'   => (string) $supplierId,
                        'supplierName' => $supplier ? $supplier->name : 'Unknown',
                    ];
                }

                $batchRemarks = [];
                foreach ($logs as $log) {
                    $batchKey = $log->created_at->toIso8601String();
                    if (!isset($batchRemarks[$batchKey])) {
                        $batchRemarks[$batchKey] = $log->remarks ?? '';
                    }
                }

                $dashboard[] = [
                    'id'            => 'entry-' . md5($key),
                    'boxName'       => '',
                    'itemName'      => $itemName,
                    'date'          => $date,
                    'totalQuantity' => $logs->count(),
                    'serialGroups'  => $serialGroups,
                    'remarks'       => $logs->first()->remarks ?? '',
                    'batchRemarks'  => $batchRemarks,
                    'mainCategory'  => $this->getCategoryName((int) $catId), // ✅ NEW
                ];
            }

            return response()->json($dashboard);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch dashboard', 'error' => $e->getMessage()], 500);
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
            'status' => 'required|in:IN_STOCK,IN_USE,STOCK_OUT,DAMAGED',
            'remarks' => 'nullable|string',
            'boxId' => 'nullable|exists:boxes,id',
        ]);

        try {
            DB::beginTransaction();

            $movedItems = [];

            foreach ($request->serialNumbers as $serialNumber) {
                $item = Item::where('serial_number', $serialNumber)->first();
                if (!$item) continue;

                $fromStatus = $item->status; 
                $item->status = $request->status;

                // Update box if moving back to stock in
                if ($request->status === 'IN_STOCK' && $request->boxId) {
                    $item->box_id = $request->boxId;
                }

                $item->save();

                StockLog::create([
                    'item_id' => $item->id,
                    'from_status' => $fromStatus,
                    'action_type' => $request->status === 'IN_STOCK' ? 'STOCK_IN' : $request->status,
                    'remarks' => $request->remarks,
                ]);

                $movedItems[] = $item;
            }

            DB::commit();

            return response()->json([
                'message' => 'Items moved successfully',
                'data' => ['count' => count($movedItems), 'status' => $request->status],
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to move items', 'error' => $e->getMessage()], 500);
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

    /*
    ======================================================
    GET STOCK OUT DASHBOARD DATA
    ======================================================
    */
    public function getStockOutDashboard($mainCategoryId)
    {
        try {
            $categoryIds = $this->getCategoryIds((int) $mainCategoryId);

            $stockOutLogs = StockLog::with(['item.subcategory', 'item.box', 'item.supplier'])
                ->where('action_type', 'STOCK_OUT')
                ->whereHas('item.box', function ($query) use ($categoryIds) {
                    $query->whereIn('main_category_id', $categoryIds);
                })
                ->get();

            $grouped = $stockOutLogs->groupBy(function ($log) {
                $date = $log->created_at ? $log->created_at->format('Y-m-d') : now()->format('Y-m-d');
                return $log->item->subcategory->name . '|' . $date . '|' . $log->item->box->main_category_id;
            });

            $dashboard = [];

            foreach ($grouped as $key => $logs) {
                [$itemName, $date, $catId] = explode('|', $key);

                $serialGroups = [];
                $bySupplier = $logs->groupBy(fn($log) => $log->item->supplier_id);

                foreach ($bySupplier as $supplierId => $supplierLogs) {
                    $supplier = $supplierLogs->first()->item->supplier;
                    $serialGroups[] = [
                        'serialNumbers' => $supplierLogs->map(fn($log) => [
                            'serial'    => $log->item->serial_number,
                            'boxName'   => $log->item->box->name,
                            'batchTime' => $log->created_at->toIso8601String(),
                            'fromStatus' => $log->from_status ?? null, 
                        ])->toArray(),
                        'supplierId'   => (string) $supplierId,
                        'supplierName' => $supplier ? $supplier->name : 'Unknown',
                    ];
                }

                $batchRemarks = [];
                foreach ($logs as $log) {
                    $batchKey = $log->created_at->toIso8601String();
                    if (!isset($batchRemarks[$batchKey])) {
                        $batchRemarks[$batchKey] = $log->remarks ?? '';
                    }
                }

                $dashboard[] = [
                    'id'            => 'entry-' . md5($key),
                    'boxName'       => '',
                    'itemName'      => $itemName,
                    'date'          => $date,
                    'totalQuantity' => $logs->count(),
                    'serialGroups'  => $serialGroups,
                    'remarks'       => $logs->first()->remarks ?? '',
                    'batchRemarks'  => $batchRemarks,
                    'mainCategory'  => $this->getCategoryName((int) $catId), // ✅ NEW
                ];
            }

            return response()->json($dashboard);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch stock out dashboard', 'error' => $e->getMessage()], 500);
        }
    }

    public function getBoxesForSubcategory($subcategoryName, $mainCategoryId)
    {
        try {
            $subcategory = Subcategory::where('name', $subcategoryName)->first();
            if (!$subcategory) return response()->json([]);

            // Query through items directly — avoids the stale subcategories.box_id join
            $boxIds = Item::where('subcategory_id', $subcategory->id)
                ->whereHas('box', function ($q) use ($mainCategoryId) {
                    $q->where('main_category_id', $mainCategoryId);
                })
                ->pluck('box_id')
                ->unique();

            $boxes = Box::whereIn('id', $boxIds)
                ->get()
                ->map(fn($b) => $b->toArray()); // return all columns to inspect

            return response()->json($boxes);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch boxes', 'error' => $e->getMessage()], 500);
        }
    }

    // ======================================================
    // ADD THESE METHODS TO StockInController.php
    // ======================================================

    /*
    ======================================================
    GET IN-USE DASHBOARD DATA
    ======================================================
    */
public function getInUseDashboard($mainCategoryId)
{
    try {
        $categoryIds = $this->getCategoryIds((int) $mainCategoryId);

        $inUseLogs = StockLog::with(['item.subcategory', 'item.box', 'item.supplier'])
            ->where('action_type', 'IN_USE')
            ->whereHas('item.box', function ($query) use ($categoryIds) {
                $query->whereIn('main_category_id', $categoryIds);
            })
            ->get();

        $grouped = $inUseLogs->groupBy(function ($log) {
            $date = $log->created_at ? $log->created_at->format('Y-m-d') : now()->format('Y-m-d');
            return $log->item->subcategory->name . '|' . $date . '|' . $log->item->box->main_category_id;
        });

        $dashboard = [];

        foreach ($grouped as $key => $logs) {
            [$itemName, $date, $catId] = explode('|', $key);

            $serialGroups = [];
            $bySupplier = $logs->groupBy(fn($log) => $log->item->supplier_id);

            foreach ($bySupplier as $supplierId => $supplierLogs) {
                $supplier = $supplierLogs->first()->item->supplier;
                $serialGroups[] = [
                    'serialNumbers' => $supplierLogs->map(fn($log) => [
                        'serial'    => $log->item->serial_number,
                        'boxName'   => $log->item->box->name,
                        'batchTime' => $log->created_at->toIso8601String(),
                        'fromStatus' => $log->from_status ?? null, 
                    ])->toArray(),
                    'supplierId'   => (string) $supplierId,
                    'supplierName' => $supplier ? $supplier->name : 'Unknown',
                ];
            }

            $batchRemarks = [];
            foreach ($logs as $log) {
                $batchKey = $log->created_at->toIso8601String();
                if (!isset($batchRemarks[$batchKey])) {
                    $batchRemarks[$batchKey] = $log->remarks ?? '';
                }
            }

            $dashboard[] = [
                'id'            => 'entry-' . md5($key),
                'boxName'       => '',
                'itemName'      => $itemName,
                'date'          => $date,
                'totalQuantity' => $logs->count(),
                'serialGroups'  => $serialGroups,
                'remarks'       => $logs->first()->remarks ?? '',
                'batchRemarks'  => $batchRemarks,
                'mainCategory'  => $this->getCategoryName((int) $catId), // ✅ NEW
            ];
        }

        return response()->json($dashboard);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Failed to fetch in-use dashboard', 'error' => $e->getMessage()], 500);
    }
}

    /*
    ======================================================
    UPDATE REMARKS FOR IN-USE ENTRY
    ======================================================
    */
    public function updateInUseRemarks(Request $request)
    {
        $request->validate([
            'serialNumbers'   => 'required|array|min:1',
            'serialNumbers.*' => 'required|string|exists:items,serial_number',
            'remarks'         => 'required|string',
        ]);

        try {
            $items = Item::whereIn('serial_number', $request->serialNumbers)->get();

            foreach ($items as $item) {
                // Update the latest IN_USE log for this item
                $latestLog = StockLog::where('item_id', $item->id)
                    ->where('action_type', 'IN_USE')
                    ->latest()
                    ->first();

                if ($latestLog) {
                    $latestLog->remarks = $request->remarks;
                    $latestLog->save();
                }
            }

            return response()->json(['message' => 'Remarks updated successfully'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update remarks',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /*
    ======================================================
    GET STOCK DAMAGE DASHBOARD DATA
    ======================================================
    */
   /*
    ======================================================
    GET STOCK DAMAGE DASHBOARD DATA
    ======================================================
    */
public function getStockDamageDashboard($mainCategoryId)
{
    try {
        $categoryIds = $this->getCategoryIds((int) $mainCategoryId);

        $damageLogs = StockLog::with(['item.subcategory', 'item.box', 'item.supplier'])
            ->where('action_type', 'DAMAGED')
            ->whereHas('item.box', function ($query) use ($categoryIds) {
                $query->whereIn('main_category_id', $categoryIds);
            })
            ->whereHas('item', function ($query) {
                $query->where('status', 'DAMAGED');
            })
            ->get();

        $grouped = $damageLogs->groupBy(function ($log) {
            $date = $log->created_at ? $log->created_at->format('Y-m-d') : now()->format('Y-m-d');
            return $log->item->subcategory->name . '|' . $date . '|' . $log->item->box->main_category_id;
        });

        $dashboard = [];

        foreach ($grouped as $key => $logs) {
            [$itemName, $date, $catId] = explode('|', $key);

            $serialGroups = [];
            $bySupplier = $logs->groupBy(fn($log) => $log->item->supplier_id);

            foreach ($bySupplier as $supplierId => $supplierLogs) {
                $supplier = $supplierLogs->first()->item->supplier;
                $serialGroups[] = [
                    'serialNumbers' => $supplierLogs->map(fn($log) => [
                        'serial'    => $log->item->serial_number,
                        'boxName'   => $log->item->box->name,
                        'batchTime' => $log->created_at->toIso8601String(),
                        'fromStatus' => $log->from_status ?? null, 
                    ])->toArray(),
                    'supplierId'   => (string) $supplierId,
                    'supplierName' => $supplier ? $supplier->name : 'Unknown',
                ];
            }

            $batchRemarks = [];
            foreach ($logs as $log) {
                $batchKey = $log->created_at->toIso8601String();
                if (!isset($batchRemarks[$batchKey])) {
                    $batchRemarks[$batchKey] = $log->remarks ?? '';
                }
            }

            $dashboard[] = [
                'id'            => 'entry-' . md5($key),
                'boxName'       => '',
                'itemName'      => $itemName,
                'date'          => $date,
                'totalQuantity' => $logs->count(),
                'serialGroups'  => $serialGroups,
                'remarks'       => $logs->first()->remarks ?? '',
                'batchRemarks'  => $batchRemarks,
                'mainCategory'  => $this->getCategoryName((int) $catId), // ✅ NEW
            ];
        }

        return response()->json($dashboard);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Failed to fetch stock damage dashboard', 'error' => $e->getMessage()], 500);
    }
}

    /*
    ======================================================
    UPDATE REMARKS FOR STOCK DAMAGE ENTRY
    ======================================================
    */
    public function updateDamageRemarks(Request $request)
    {
        $request->validate([
            'serialNumbers'   => 'required|array|min:1',
            'serialNumbers.*' => 'required|string|exists:items,serial_number',
            'remarks'         => 'required|string',
        ]);

        try {
            $items = Item::whereIn('serial_number', $request->serialNumbers)->get();

            foreach ($items as $item) {
                $latestLog = StockLog::where('item_id', $item->id)
                    ->where('action_type', 'DAMAGED')
                    ->latest()
                    ->first();

                if ($latestLog) {
                    $latestLog->remarks = $request->remarks;
                    $latestLog->save();
                }
            }

            return response()->json(['message' => 'Remarks updated successfully'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update remarks',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

 
}