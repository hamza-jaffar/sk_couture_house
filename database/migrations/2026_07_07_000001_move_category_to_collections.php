<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collections', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('id')->constrained('categories')->nullOnDelete();
        });

        Schema::table('collection_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
        });
    }

    public function down(): void
    {
        Schema::table('collection_items', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('collection_id')->constrained('categories')->nullOnDelete();
        });

        Schema::table('collections', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
        });
    }
};
