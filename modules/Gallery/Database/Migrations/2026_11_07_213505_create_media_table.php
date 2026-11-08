<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();

            // Unique file identifier
            $table->uuid('uuid')->unique();

            // File naming & identification
            $table->string('title')->nullable()->comment('Editable user title');
            $table->string('alt_text')->nullable();
            $table->string('caption')->nullable();
            $table->string('description')->nullable();

            $table->string('file_name')->comment('Stored filename on disk');
            $table->string('original_file_name');
            $table->string('mime_type')->index();
            $table->string('disk')->default('public');
            $table->string('path');

            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();

            $table->unsignedBigInteger('size');

            $table->string('type')->index()->comment('File type classification');

            $table->json('metadata')->nullable();

            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
