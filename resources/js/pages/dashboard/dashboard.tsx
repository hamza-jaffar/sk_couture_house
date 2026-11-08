import Gallery from "@/components/gallery";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Dashboard() {
    const [openGalleryPicker, setOpenGalleryPicker] = useState<boolean>(false);
    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <Button onClick={() => setOpenGalleryPicker(!openGalleryPicker)}>
                Open Gallery Picker
            </Button>
            <Gallery
                mode="dialog"
                open={openGalleryPicker}
                onOpenChange={() => setOpenGalleryPicker(false)}
                selectionMode="multiple"
                onSelect={() => {}}
            />
        </div>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: "Dashboard",
            href: "/dashboard",
        },
    ],
};
