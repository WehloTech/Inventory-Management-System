<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MasterlistController extends Controller
{
    /**
     * Return Usher stock summary for Masterlist / React page
     */
    public function usherStocks()
    {
        $stocks = DB::select("
            SELECT
                s.id AS stock_id,
                s.location,
                s.subCategory,

                GROUP_CONCAT(DISTINCT i.serialNumber) AS serial_numbers,

                COALESCE(SUM(CASE WHEN sl.type = 'IN' THEN sl.quantity END), 0) AS `IN`,
                COALESCE(SUM(CASE WHEN sl.type = 'OUT' THEN sl.quantity END), 0) AS `OUT`,
                COALESCE(SUM(CASE WHEN sl.type = 'DAMAGE' THEN sl.quantity END), 0) AS `DAMAGE`,
                COALESCE(SUM(CASE WHEN sl.type = 'IN USE' THEN sl.quantity END), 0) AS `IN_USE`,

                (
                    COALESCE(SUM(CASE WHEN sl.type = 'IN' THEN sl.quantity END), 0)
                    -
                    COALESCE(SUM(CASE WHEN sl.type = 'OUT' THEN sl.quantity END), 0)
                    -
                    COALESCE(SUM(CASE WHEN sl.type = 'DAMAGE' THEN sl.quantity END), 0)
                ) AS total_items,

                GROUP_CONCAT(DISTINCT sup.name) AS suppliers

            FROM stocks s
            LEFT JOIN items i       ON i.stock_id = s.id
            LEFT JOIN stock_logs sl ON sl.item_id = i.id
            LEFT JOIN suppliers sup ON sup.stock_id = s.id

            WHERE s.mainCategory = 'Usher'

            GROUP BY s.id, s.location, s.subCategory
        ");

        return response()->json($stocks);
    }
}
