<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subcategory extends Model
{
    protected $fillable = ['name', 'box_id'];

    public function items()
    {
        return $this->hasMany(Item::class);
    }
}
