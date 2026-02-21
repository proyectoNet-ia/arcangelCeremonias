export interface Product {
    id: string;
    name: string;
    description: string;
    price?: number;
    category: 'bautizo' | 'comunion' | 'boda' | 'accesorios';
    images: string[];
    featured?: boolean;
}

export interface ShopConfig {
    enableCart: boolean;
    enableCheckout: boolean;
    showPrices: boolean;
    contactMode: 'whatsapp' | 'checkout';
    whatsappNumber: string;
}
