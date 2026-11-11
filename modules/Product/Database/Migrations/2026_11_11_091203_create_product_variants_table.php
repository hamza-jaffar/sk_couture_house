<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();

            $table->string('sku')->unique();
            $table->string('name'); // e.g., "Black / Medium"

            // Variant-specific pricing & sales
            $table->decimal('price', 10, 2)->nullable(); // Falls back to parent product if null
            $table->decimal('sale_price', 10, 2)->nullable();

            // Variant Inventory
            $table->unsignedInteger('stock')->default(0);

            // Storing option attributes (e.g., {"color": "Black", "size": "Medium"})
            $table->json('attributes');

            // Optional variant-specific image (e.g., showing the shirt in Red)
            $table->string('image')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
