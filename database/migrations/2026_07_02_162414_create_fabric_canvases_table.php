<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('fabric_canvases', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('desc')->nullable();
            $table->string('origin_mill')->nullable();
            $table->string('density_weight')->nullable();
            $table->string('structure')->nullable();
            $table->string('formulation')->nullable();
            $table->string('rigidity')->nullable();
            $table->string('breathability')->nullable();
            $table->integer('warmth')->nullable();
            $table->integer('luster')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fabric_canvases');
    }
};
