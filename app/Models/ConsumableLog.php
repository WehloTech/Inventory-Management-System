<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsumableLog extends Model
{
    protected $fillable = [
        'consumable_item_id',
        'action_type',
        'quantity',
        'remarks',
    ];

    public function consumableItem()
    {
        return $this->belongsTo(ConsumableItem::class);
    }
}