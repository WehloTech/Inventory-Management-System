<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockLog extends Model
{
    protected $fillable = ['item_id', 'action_type', 'remarks'];

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
