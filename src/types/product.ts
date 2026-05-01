export interface SizeVariant {
    size: string;
    price: number;
    sku?: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    detailed_description?: string;
    price?: number; // Base price or starting price
    show_price: boolean;
    category_id: string;
    subcategory?: string;

    // Características Específicas
    model_code?: string;
    material?: string;
    color?: string;
    includes?: string;
    sizes?: string[];
    size_variants?: SizeVariant[]; // Map of sizes to specific prices

    // Multimedia
    main_image: string;
    gallery?: string[];

    // Metadata
    featured?: boolean;
    badges?: string[];
    stock_status?: 'available' | 'on_request' | 'out_of_stock';
    is_active?: boolean;
    created_at?: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    parent_id?: string | null;
    image_url?: string;
    icon_url?: string;
    size_guide_url?: string;
    description?: string;
    is_active?: boolean;
}

export interface ShopConfig {
    enableCart: boolean;
    enableCheckout: boolean;
    showPrices: boolean;
    contactMode: 'whatsapp' | 'checkout';
    whatsappNumber: string;
}
