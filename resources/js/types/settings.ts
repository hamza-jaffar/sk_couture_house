export type PlatformSettings = {
    general: {
        name: string;
        tagline: string;
        description: string;
        website_url: string;
        timezone: string;
        currency: string;
        currency_icon: string;
        logo_path: string | null;
        favicon_path: string | null;
        logo_url: string | null;
        favicon_url: string | null;
    };
    contact: {
        email: string;
        phone: string;
        alternate_phone: string;
        address: string;
        address_line_2: string;
        city: string;
        region: string;
        postal_code: string;
        country: string;
        business_hours: string;
    };
    social: {
        facebook: string;
        instagram: string;
        tiktok: string;
        youtube: string;
        pinterest: string;
        linkedin: string;
        x: string;
    };
    mail: {
        host: string;
        port: number;
        encryption: 'tls' | 'ssl' | 'none';
        username: string;
        from_address: string;
        from_name: string;
        has_password: boolean;
    };
    variants: ProductVariant[];
};

export type ProductVariant = {
    id?: string;
    name: string;
    values: string[];
};
