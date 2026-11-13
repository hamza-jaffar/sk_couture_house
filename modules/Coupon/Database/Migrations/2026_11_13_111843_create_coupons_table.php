<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();

            $table->string('code')->unique(); // e.g., "SUMMER20", "WELCOME10"
            $table->string('description')->nullable(); // Internal admin note

            $table->enum('discount_type', ['percentage', 'fixed']);
            $table->decimal('discount_value', 10, 2); // e.g., 20.00 (for 20% or $20)

            $table->decimal('min_spend', 10, 2)->nullable(); // Minimum order total required
            $table->decimal('max_discount', 10, 2)->nullable(); // Cap for percentage discounts (e.g., max $50 off)

            // Usage Constraints
            $table->unsignedInteger('usage_limit')->nullable();          // Total global uses allowed
            $table->unsignedInteger('usage_limit_per_user')->nullable(); // Uses allowed per customer
            $table->unsignedInteger('times_used')->default(0);           // Current usage counter

            // Campaign Validity Window
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();

            // Status Toggle
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            // Indexing for rapid coupon validation at checkout
            $table->index(['code', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
