<?php

namespace App\Http\Controllers\USHER;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class MasterListController extends Controller
{
    /**
     * Map system names to main category IDs
     */
    private function getCategoryId($system)
    {
        $categoryMap = [
            'usher' => 1,
            'usherette' => 2,
            'wehlo' => 3,
            'hoclomac' => 4,
            'all' => 5,
        ];
        
        return $categoryMap[$system] ?? 1;
    }

    /**
     * Show the master list view
     * Displays all inventory boxes for a specific system
     * 
     * @param string $system The system name (usher, usherette, etc.)
     */
    public function index($system)
    {
        $mainCategoryId = $this->getCategoryId($system);
        
        return Inertia::render('Inventory/MasterList', [
            'mainCategoryId' => $mainCategoryId,
            'system' => $system,
        ]);
    }

    /**
     * Show the action view for a specific box
     * Displays all subcategories and items for the selected box
     * 
     * @param string $system The system name
     * @param int $boxId The ID of the box to display
     */
    public function show($system, $boxId)
    {
        $mainCategoryId = $this->getCategoryId($system);
        
        return Inertia::render('Inventory/ActionViewU', [
            'mainCategoryId' => $mainCategoryId,
            'system' => $system,
            'boxId' => (int) $boxId,
        ]);
    }

    /**
     * Show serial numbers for a specific subcategory
     * 
     * @param string $system The system name
     * @param int $boxId The ID of the box
     * @param int $subcategoryId The ID of the subcategory
     */
    public function showSerials($system, $boxId, $subcategoryId)
    {
        $mainCategoryId = $this->getCategoryId($system);
        
        return Inertia::render('Inventory/SerialNumberView', [
            'mainCategoryId' => $mainCategoryId,
            'system' => $system,
            'boxId' => (int) $boxId,
            'subcategoryId' => (int) $subcategoryId,
        ]);
    }
}