<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateStocksTable extends Migration
{
    public function up()
    {
        Schema::create('stocks', function (Blueprint $table) {
            $table->id(); 
            $table->string('location');

            
            $table->enum('mainCategory', ['Usher', 'Usherette', 'Wehlo', 'Hoclomac']);

            
            $table->string('subCategory');

            $table->string('manufacturer', 100)->nullable();
            $table->string('unit', 50);

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('stocks');
    }
};