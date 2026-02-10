<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $fillable = [
        'subcategory_id', 'box_id', 'supplier_id', 'serial_number', 'status'
    ];

    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }

    public function box()
    {
        return $this->belongsTo(Box::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function stockLogs()
    {
        return $this->hasMany(StockLog::class);
    }
}
