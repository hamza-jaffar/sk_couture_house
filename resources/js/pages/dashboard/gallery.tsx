import GalleryComponent from '@/components/gallery';
import type { GalleryFilters, PaginatedGalleryMedia } from '@/types';

type Props = {
    media?: PaginatedGalleryMedia;
    filters: GalleryFilters;
    canUpload: boolean;
    canDelete: boolean;
    canRestore: boolean;
    canForceDelete: boolean;
};

export default function Gallery(props: Props) {
    return <GalleryComponent {...props} />;
}

Gallery.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Gallery', href: '/dashboard/gallery' },
    ],
};
