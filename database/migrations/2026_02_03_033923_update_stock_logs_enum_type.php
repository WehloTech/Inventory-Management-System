<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateStockLogsEnumType extends Migration
{
    public function up()
    {
        // For SQLite, ALTER TABLE is limited
        // So we need to rename the table, create a new one, copy data
        Schema::table('stock_logs', function (Blueprint $table) {
            // SQLite can't directly alter CHECK constraints
            // We'll do a raw statement to drop and recreate column if needed
        });

        // Alternative: raw SQL for SQLite
        \DB::statement("CREATE TABLE stock_logs_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
            type TEXT NOT NULL CHECK(type IN ('IN','OUT','DAMAGE','IN USE')),
            quantity INTEGER NOT NULL,
            date DATE NOT NULL,
            notes TEXT,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        );");

        // Copy old data
        \DB::statement("INSERT INTO stock_logs_new (id, item_id, type, quantity, date, notes, created_at, updated_at)
                        SELECT id, item_id, type, quantity, date, notes, created_at, updated_at FROM stock_logs;");

        // Drop old table and rename new one
        Schema::dropIfExists('stock_logs');
        \DB::statement("ALTER TABLE stock_logs_new RENAME TO stock_logs;");
    }

    public function down()
    {
        // revert to original
        \DB::statement("CREATE TABLE stock_logs_old (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
            type TEXT NOT NULL CHECK(type IN ('IN','OUT','DAMAGE')),
            quantity INTEGER NOT NULL,
            date DATE NOT NULL,
            notes TEXT,
            created_at TIMESTAMP NULL,
            updated_at TIMESTAMP NULL
        );");

        \DB::statement("INSERT INTO stock_logs_old (id, item_id, type, quantity, date, notes, created_at, updated_at)
                        SELECT id, item_id, type, quantity, date, notes, created_at, updated_at FROM stock_logs;");

        Schema::dropIfExists('stock_logs');
        \DB::statement("ALTER TABLE stock_logs_old RENAME TO stock_logs;");
    }
}

