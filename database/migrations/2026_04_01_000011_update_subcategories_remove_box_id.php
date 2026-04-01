<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('subcategories', function (Blueprint $table) {
            $table->dropForeign(['box_id']);
            $table->dropColumn('box_id');
            $table->unique('name');
        });
    }

    public function down(): void
    {
        Schema::table('subcategories', function (Blueprint $table) {
            $table->dropUnique(['name']);
            $table->foreignId('box_id')->constrained()->cascadeOnDelete();
        });
    }
};