import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/types/product';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Link } from 'react-router-dom';

interface ProductCardProps {
    product: Product;
    index: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group cursor-pointer"
        >
            <Link to={`/producto/${product.slug}`}>
                <div className="relative overflow-hidden bg-white aspect-[3/4] mb-4">
                    <img
                        src={product.main_image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Quick View or Badge */}
                    {product.featured && (
                        <div className="absolute top-4 left-4">
                            <span className="bg-gold text-white text-[10px] uppercase tracking-[0.2em] px-3 py-1 font-medium backdrop-blur-sm">
                                Destacado
                            </span>
                        </div>
                    )}
                </div>

                <div className="text-left space-y-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-serif text-lg text-chocolate group-hover:text-gold transition-colors duration-300">
                            {product.name}
                        </h3>
                        {product.show_price && product.price && (
                            <span className="font-sans text-sm text-chocolate/60">
                                ${product.price.toLocaleString('es-MX')}
                            </span>
                        )}
                    </div>

                    <p className="text-xs text-chocolate/50 uppercase tracking-widest font-medium">
                        {product.material || 'Material Premium'}
                    </p>

                    <div className="pt-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                        <button
                            className="w-full py-3 border border-chocolate text-chocolate text-[10px] uppercase tracking-[0.2em] hover:bg-chocolate hover:text-cream transition-all duration-300 flex items-center justify-center gap-2"
                            onClick={(e) => {
                                e.preventDefault(); // Prevent navigating to detail page when clicking WhatsApp
                                e.stopPropagation();
                                window.open(`https://wa.me/523521681197?text=Hola, me interesa el producto: ${product.name}`, '_blank');
                            }}
                        >
                            <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                            Consultar disponibilidad
                        </button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};
