<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('desc')->nullable();
            $table->foreignId('featured_collection_id')->nullable()->constrained('collections')->nullOnDelete();
            $table->timestamps();
        });

        Schema::table('collection_items', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('collection_id')->constrained('categories')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('collection_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
        });

        Schema::dropIfExists('categories');
    }
};
