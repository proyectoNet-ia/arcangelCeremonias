import React from 'react';
import { Product } from '@/types/product';
import { SHOP_CONFIG } from '@/config/shop';

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const whatsappUrl = `https://wa.me/${SHOP_CONFIG.whatsappNumber}?text=Hola! Me interesa información sobre el modelo: ${product.name}`;

    return (
        <div className="group bg-white border border-gold/10 hover:border-gold/30 transition-all duration-500 overflow-hidden flex flex-col h-full">
            {/* Image Container */}
            <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4">
                    <span className="bg-gold/90 text-white text-[10px] uppercase tracking-widest px-2 py-1">
                        {product.category}
                    </span>
                </div>
            </div>

            {/* Info Container */}
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-serif text-xl text-chocolate mb-2">{product.name}</h3>
                <p className="text-sm text-chocolate/60 line-clamp-2 mb-6 flex-grow">
                    {product.description}
                </p>

                <div className="mt-auto pt-4 border-t border-gold/10">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center py-3 bg-chocolate text-cream text-xs uppercase tracking-[0.2em] hover:bg-gold hover:text-chocolate transition-colors duration-300"
                    >
                        Consultar por WhatsApp
                    </a>
                </div>
            </div>
        </div>
    );
};
