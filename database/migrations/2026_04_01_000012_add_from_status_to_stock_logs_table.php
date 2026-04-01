<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_logs', function (Blueprint $table) {
            $table->enum('from_status', ['IN_STOCK', 'IN_USE', 'STOCK_OUT', 'DAMAGED'])
                  ->nullable()
                  ->after('item_id');
        });
    }

    public function down(): void
    {
        Schema::table('stock_logs', function (Blueprint $table) {
            $table->dropColumn('from_status');
        });
    }
};