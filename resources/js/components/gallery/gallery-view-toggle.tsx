import { Button } from "@/components/ui/button";
import { GalleryView } from "@/types";
import { LayoutGrid, List } from "lucide-react";

type GalleryViewToggleProps = {
    value: GalleryView;
    onChange: (view: GalleryView) => void;
};

export default function GalleryViewToggle({
    value,
    onChange,
}: GalleryViewToggleProps) {
    return (
        <div
            role="group"
            aria-label="Gallery display"
            className="flex shrink-0 items-center rounded-lg border p-1"
        >
            <Button
                type="button"
                size="icon-sm"
                variant={value === "grid" ? "secondary" : "ghost"}
                aria-label="Card view"
                aria-pressed={value === "grid"}
                title="Card view"
                onClick={() => onChange("grid")}
            >
                <LayoutGrid />
            </Button>
            <Button
                type="button"
                size="icon-sm"
                variant={value === "list" ? "secondary" : "ghost"}
                aria-label="List view"
                aria-pressed={value === "list"}
                title="List view"
                onClick={() => onChange("list")}
            >
                <List />
            </Button>
        </div>
    );
}

export type { GalleryView };
