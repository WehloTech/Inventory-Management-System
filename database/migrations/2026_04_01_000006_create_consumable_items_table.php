<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consumable_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('box_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subcategory_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->integer('quantity')->default(0);
            $table->timestamps();

            // Unique: one subcategory per box (no duplicates)
            $table->unique(['box_id', 'subcategory_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consumable_items');
    }
};