<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Box extends Model
{
    protected $fillable = ['name', 'main_category_id'];

    public function mainCategory()
    {
        return $this->belongsTo(MainCategory::class);
    }

    public function items()
    {
        return $this->hasManyThrough(Item::class, Subcategory::class);
    }
}
