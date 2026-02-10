<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MainCategory extends Model
{
    protected $fillable = ['name'];

    public function boxes()
    {
        return $this->hasMany(Box::class);
    }
}
