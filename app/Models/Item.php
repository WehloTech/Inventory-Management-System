<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{


    protected $fillable = [
        'name',
        'serialNumber',
        'description',
        'stock_id'
    ];

    public function stock()
    {
        return $this->belongsTo(Stock::class, 'stock_id');
    }

    public function stockLogs()
    {
        return $this->hasMany(StockLog::class, 'item_id');
    }
}
