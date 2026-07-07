export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    type: "user" | "admin";
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type Frontend = {
    information: Settings
}

export type Settings = {
    [key: string] : string;
}

export type MarqueeWord = {
    text: string;
    color: string;
};

export type FrontendData = {
    id?: number;
    hero_title?: string;
    hero_watermark?: string;
    hero_desc?: string;
    hero_image?: string;
    marquee?: MarqueeWord[];
    scroll_indicator_text?: string;
    lookbook_tag?: string;
    fabric_canvas_title?: string;
    footer_title?: string;
};

export type CollectionItemType = {
    id: number;
    piece_title: string;
    peice_title?: string;
    desc: string | null;
    note: string | null;
    gsm: string | null;
    image?: string | null;
};

export type CategoryType = {
    id: number;
    name: string;
    desc: string | null;
    featured_collection?: { id: number; title: string } | null;
    collections: Array<{
        id: number;
        title: string;
        desc: string | null;
        items: CollectionItemType[];
    }>;
};

export type FeaturedCollection = {
    id: number;
    title: string;
    desc: string | null;
    is_featured: boolean;
    items: CollectionItemType[];
};

export type FabricCanvasItem = {
    id: number;
    name: string;
    origin_mill: string | null;
    density_weight: string | null;
    structure: string | null;
    formulation: string | null;
    rigidity: number | null;
    breathability: number | null;
    warmth: number | null;
    luster: number | null;
    desc: string | null;
};

/* @chisel-passkeys */
export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};
/* @end-chisel-passkeys */

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
