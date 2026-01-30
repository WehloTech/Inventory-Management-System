<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStockLogsTable extends Migration
{
    public function up()
    {
        Schema::create('stock_logs', function (Blueprint $table) {
            $table->id();

            // Foreign key to Item
            $table->foreignId('item_id')->constrained('items')->onDelete('cascade');

            $table->enum('type', ['IN','OUT','DAMAGE']);
            $table->integer('quantity');
            $table->date('date');
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('stock_logs');
    }
};
