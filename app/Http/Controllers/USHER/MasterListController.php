<?php

namespace App\Http\Controllers\USHER;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class MasterListController extends Controller
{
    /**
     * Show the master list view
     * Displays all inventory boxes
     */
    public function index()
    {
        return Inertia::render('USHER/MasterList');
    }

    /**
     * Show the action view for a specific box
     * Displays all subcategories and items for the selected box
     * 
     * @param int $boxId The ID of the box to display
     */
    public function show($boxId)
    {
        // For now, we'll pass the boxId and let the frontend component handle the data
        // TODO: Fetch the box with its subcategories and serial items from database
        // Example:
        // $box = InventoryBox::with('subcategories.serialItems')->findOrFail($boxId);
        
        return Inertia::render('USHER/ActionViewU', [
            'boxId' => (int) $boxId,
        ]);
    }
}