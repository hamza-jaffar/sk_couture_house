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
        Schema::create('frontend_data', function (Blueprint $table) {
            $table->id();
            $table->string('hero_watermark')->nullable();
            $table->string('hero_title')->nullable();
            $table->string('hero_desc')->nullable();
            $table->string('hero_image')->nullable();
            $table->json('marquee')->nullable();
            $table->string('scroll_indicator_text')->nullable();
            $table->string('lookbook_tag')->nullable();
            $table->string('fabric_canvas_title')->nullable();
            $table->string('footer_title')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('frontend_data');
    }
};
