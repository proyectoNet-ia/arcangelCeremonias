import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '@/types/product';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faShareNodes, faLeaf, faGem, faScissors, faCloud, faAward } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

interface ProductCardProps {
    product: Product;
    index: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
    const [isLoaded, setIsLoaded] = React.useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group cursor-pointer relative"
        >
            <Link to={`/producto/${product.slug}`}>
                <div className="relative overflow-hidden bg-slate-50 aspect-[3/4] mb-5 shadow-sm group-hover:shadow-xl transition-shadow duration-700">
                    {/* Skeleton / Placeholder */}
                    {!isLoaded && (
                        <div className="absolute inset-0 bg-chocolate/5 animate-pulse flex items-center justify-center">
                            <div className="w-10 h-[1px] bg-gold/20" />
                        </div>
                    )}

                    <img
                        src={product.main_image}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        onLoad={() => setIsLoaded(true)}
                        className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    {/* Dynamic Badges System */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {(() => {
                            const isNew = product.created_at ? (new Date().getTime() - new Date(product.created_at).getTime()) < (7 * 24 * 60 * 60 * 1000) : false;
                            const displayBadges = [...(isNew ? ['NUEVO'] : []), ...(product.badges || [])];

                            return displayBadges.map((badge, bIdx) => (
                                <span
                                    key={bIdx}
                                    className={`backdrop-blur-md text-[9px] uppercase tracking-[0.3em] px-3 py-1.5 font-bold shadow-sm border ${badge.toUpperCase() === 'NUEVO'
                                        ? 'bg-gold text-white border-gold/20'
                                        : badge.toUpperCase() === 'PREMIUM'
                                            ? 'bg-chocolate text-gold border-gold/30'
                                            : 'bg-white/90 text-chocolate border-gold/10'
                                        }`}
                                >
                                    {badge}
                                </span>
                            ));
                        })()}
                    </div>

                    {/* Share Button Overlay */}
                    <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (navigator.share) {
                                    navigator.share({
                                        title: `Arcángel Ceremonias - ${product.name}`,
                                        text: `Mira este producto en Arcángel Ceremonias: ${product.name}`,
                                        url: `${window.location.origin}/producto/${product.slug}`,
                                    }).catch(console.error);
                                } else {
                                    navigator.clipboard.writeText(`${window.location.origin}/producto/${product.slug}`);
                                    alert('¡Enlace copiado al portapapeles!');
                                }
                            }}
                            className="bg-white/95 backdrop-blur-sm text-chocolate w-9 h-9 flex items-center justify-center rounded-full hover:bg-gold hover:text-white transition-all duration-300 shadow-md border border-gold/5"
                        >
                            <FontAwesomeIcon icon={faShareNodes} className="text-xs" />
                        </button>
                    </div>
                </div>

                <div className="text-left space-y-2 px-1">
                    <div className="relative inline-block">
                        <h3 className="font-serif text-[19px] text-chocolate group-hover:text-gold transition-colors duration-500 leading-tight">
                            {product.name}
                        </h3>
                        <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold group-hover:w-full transition-all duration-700 ease-out" />
                    </div>

                    <div className="flex items-center gap-2.5 text-chocolate/40 group-hover:text-chocolate/60 transition-colors duration-500">
                        <FontAwesomeIcon icon={faAward} className="text-[10px] text-gold/60" />
                        <p className="text-[10px] uppercase tracking-[0.25em] font-medium">
                            {product.material || 'Artesanía de Autor'}
                        </p>
                    </div>

                    <div className="pt-2 opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-700">
                        <button
                            className="w-full py-3.5 bg-chocolate text-cream text-[9px] uppercase tracking-[0.3em] font-bold hover:bg-gold hover:shadow-lg transition-all duration-500 flex items-center justify-center gap-3"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const model = product.model_code || product.slug.toUpperCase();
                                const color = product.color || 'No especificado';
                                const mat = product.material || 'No especificado';
                                const url = `${window.location.origin}/producto/${product.slug}`;
                                const msg = [
                                    `\u00a1Hola! Me interesa el siguiente producto de *Arc\u00e1ngel Ceremonias*:`,
                                    ``,
                                    `\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`,
                                    `\ud83c\udff7\ufe0f *Producto:* ${product.name}`,
                                    `\ud83d\udd16 *Modelo:* ${model}`,
                                    `\ud83c\udfa8 *Color:* ${color}`,
                                    `\ud83e\uddf5 *Material:* ${mat}`,
                                    `\ud83d\udd17 *Ver producto:* ${url}`,
                                    `\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501`,
                                    `\ud83d\udecd\ufe0f *Canal:* Cat\u00e1logo web`,
                                    ``,
                                    `\u00bfPodr\u00edan darme m\u00e1s informaci\u00f3n sobre disponibilidad, tallas y formas de pago?`,
                                ].join('\n');
                                window.open(`https://wa.me/523521681197?text=${encodeURIComponent(msg)}`, '_blank');
                            }}
                        >
                            <FontAwesomeIcon icon={faWhatsapp} className="text-sm" />
                            Consultar Disponibilidad
                        </button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};
