<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MainCategory;

class MainCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = ['USHER', 'HOCLOMAC', 'USHERETTE', 'WEHLO'];

        foreach ($categories as $name) {
            MainCategory::updateOrCreate(['name' => $name]);
        }
    }
}
