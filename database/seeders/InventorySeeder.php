<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Box;
use App\Models\Subcategory;
use App\Models\Supplier;
use App\Models\Item;
use App\Models\MainCategory;

class InventorySeeder extends Seeder
{
    public function run(): void
    {
        // Main Categories
        $usher = MainCategory::where('name','USHER')->first();
        $wehlo = MainCategory::where('name','WEHLO')->first();
        $hoclomac = MainCategory::where('name','HOCLOMAC')->first();
        $usherette = MainCategory::where('name','USHERETTE')->first();

        // Boxes
        $box1 = Box::create(['name' => 'Box A', 'main_category_id' => $usher->id]);
        $box2 = Box::create(['name' => 'Box B', 'main_category_id' => $usher->id]);
        $box3 = Box::create(['name' => 'Box C', 'main_category_id' => $wehlo->id]);
        $box4 = Box::create(['name' => 'Box D', 'main_category_id' => $hoclomac->id]);
        $box5 = Box::create(['name' => 'Box E', 'main_category_id' => $usherette->id]);

        // Subcategories
        $sub1 = Subcategory::create(['name' => 'Raspberry Pi 4', 'box_id' => $box1->id]);
        $sub2 = Subcategory::create(['name' => 'Laptop', 'box_id' => $box1->id]);
        $sub3 = Subcategory::create(['name' => 'Monitor', 'box_id' => $box2->id]);
        $sub4 = Subcategory::create(['name' => 'Arduino Uno', 'box_id' => $box3->id]);
        $sub5 = Subcategory::create(['name' => 'Keyboard', 'box_id' => $box4->id]);
        $sub6 = Subcategory::create(['name' => 'Mouse', 'box_id' => $box5->id]);

        // Suppliers
        $sup1 = Supplier::create(['name' => 'Tech Supplier', 'email' => 'tech@email.com', 'contact_number' => '09123456789']);
        $sup2 = Supplier::create(['name' => 'Gadgets Co', 'email' => 'gadgets@email.com', 'contact_number' => '09987654321']);
        $sup3 = Supplier::create(['name' => 'ElectroMart', 'email' => 'electro@email.com', 'contact_number' => '09223334444']);
        $sup4 = Supplier::create(['name' => 'Parts Unlimited', 'email' => 'parts@email.com', 'contact_number' => '09335556666']);

        // Items
        // Box A - Raspberry Pi
        for ($i = 1; $i <= 5; $i++) {
            Item::create([
                'subcategory_id' => $sub1->id,
                'box_id' => $box1->id,
                'supplier_id' => $sup1->id,
                'serial_number' => 'RP4-00'.$i,
                'status' => 'IN_STOCK'
            ]);
        }

        // Box A - Laptop
        for ($i = 1; $i <= 3; $i++) {
            Item::create([
                'subcategory_id' => $sub2->id,
                'box_id' => $box1->id,
                'supplier_id' => $sup2->id,
                'serial_number' => 'LP-00'.$i,
                'status' => $i % 2 == 0 ? 'IN_USE' : 'IN_STOCK'
            ]);
        }

        // Box B - Monitor
        for ($i = 1; $i <= 4; $i++) {
            Item::create([
                'subcategory_id' => $sub3->id,
                'box_id' => $box2->id,
                'supplier_id' => $sup3->id,
                'serial_number' => 'MON-00'.$i,
                'status' => 'IN_STOCK'
            ]);
        }

        // Box C - Arduino
        for ($i = 1; $i <= 6; $i++) {
            Item::create([
                'subcategory_id' => $sub4->id,
                'box_id' => $box3->id,
                'supplier_id' => $sup4->id,
                'serial_number' => 'ARD-00'.$i,
                'status' => 'IN_STOCK'
            ]);
        }

        // Box D - Keyboard
        for ($i = 1; $i <= 5; $i++) {
            Item::create([
                'subcategory_id' => $sub5->id,
                'box_id' => $box4->id,
                'supplier_id' => $sup2->id,
                'serial_number' => 'KB-00'.$i,
                'status' => $i == 1 ? 'DAMAGED' : 'IN_STOCK'
            ]);
        }

        // Box E - Mouse
        for ($i = 1; $i <= 5; $i++) {
            Item::create([
                'subcategory_id' => $sub6->id,
                'box_id' => $box5->id,
                'supplier_id' => $sup1->id,
                'serial_number' => 'MS-00'.$i,
                'status' => $i <= 2 ? 'IN_USE' : 'IN_STOCK'
            ]);
        }
    }
}
