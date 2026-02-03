<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockLog extends Model
{
    const TYPES = ['IN', 'OUT', 'DAMAGE', 'IN USE'];

    protected $fillable = [
        'item_id',
        'type',
        'quantity',
        'date',
        'notes'
    ];
}
