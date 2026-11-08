import type { GalleryProps } from '@/types';
import GalleryManager from './gallery/gallery-manager';
import GalleryPicker from './gallery/gallery-picker';

export default function Gallery(props: GalleryProps) {
    if (props.mode === 'dialog') {
        return <GalleryPicker {...props} />;
    }

    return <GalleryManager {...props} />;
}
