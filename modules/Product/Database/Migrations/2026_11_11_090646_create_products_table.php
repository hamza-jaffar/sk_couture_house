<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            // Basic Info
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();

            // Pricing & Sales (Base pricing, overridden by variants if variable)
            $table->decimal('price', 10, 2)->default(0.00);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->timestamp('sale_start_at')->nullable();
            $table->timestamp('sale_end_at')->nullable();

            // Inventory & Identification (For simple products)
            $table->string('sku')->unique()->nullable();
            $table->unsignedInteger('stock')->default(0);

            // Configuration & Status
            // 'simple' (e.g., accessories) vs 'variable' (e.g., T-shirt with sizes/colors)
            $table->enum('type', ['simple', 'variable'])->default('variable');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->boolean('is_featured')->default(false);

            // Relations
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();

            // Extra metadata (e.g., material: "100% Cotton", care: "Machine wash cold")
            $table->json('metadata')->nullable();

            // ==========================================
            // SEO & Structured Data Fields
            // ==========================================

            // Meta Title (Falls back to `title` if null)
            $table->string('meta_title')->nullable();

            // Meta Description (Falls back to `short_description` if null)
            $table->string('meta_description', 160)->nullable();

            // Search Keywords (Comma-separated or tag list)
            $table->string('meta_keywords')->nullable();

            // Canonical URL (Prevents duplicate content issues when variants share URLs)
            $table->string('canonical_url')->nullable();

            // Social Media / Open Graph (OG) Overrides
            $table->string('og_title')->nullable();
            $table->text('og_description')->nullable();
            $table->string('og_image')->nullable(); // Social sharing thumbnail path

            // Robots Indexing directives ('index, follow', 'noindex, nofollow')
            $table->string('robots_meta')->default('index, follow');

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'created_at']);
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
