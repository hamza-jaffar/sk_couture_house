<?php

namespace Modules\Gallery\Console;

use Illuminate\Console\Command;
use Modules\Gallery\Service\GalleryService;

class MigrateGalleryStorage extends Command
{
    protected $signature = 'gallery:migrate-storage';

    protected $description = 'Move active gallery files to public storage and quarantined files to private storage';

    public function handle(GalleryService $galleryService): int
    {
        $migratedCount = $galleryService->migrateStorage();

        $this->info("Migrated {$migratedCount} gallery files.");

        return self::SUCCESS;
    }
}
