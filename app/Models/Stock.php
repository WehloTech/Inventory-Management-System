<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Stock extends Model
{
    protected $fillable = [
        'location',
        'mainCategory',
        'subCategory',
        'manufacturer',
        'unit'
    ];

    public function items()
    {
        return $this->hasMany(Item::class, 'stock_id');
    }

    public function suppliers()
    {
        return $this->hasMany(Supplier::class, 'stock_id');
    }
}
