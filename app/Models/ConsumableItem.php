<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsumableItem extends Model
{
    protected $fillable = [
        'box_id',
        'subcategory_id',
        'supplier_id',
        'quantity',
    ];

    public function box()
    {
        return $this->belongsTo(Box::class);
    }

    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function logs()
    {
        return $this->hasMany(ConsumableLog::class);
    }
}