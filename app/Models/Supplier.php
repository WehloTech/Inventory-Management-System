<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = ['name', 'email', 'contact_number'];

    public function items()
    {
        return $this->hasMany(Item::class);
    }
}
