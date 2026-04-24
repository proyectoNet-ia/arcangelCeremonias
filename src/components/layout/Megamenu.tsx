import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { Category } from '../../types/product';

export const Megamenu: React.FC<{ isOpen: boolean; onClose: () => void; onOpen: () => void }> = ({ isOpen, onClose, onOpen }) => {
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await productService.getCategories();
                setCategories(data);
            } catch (err) {
                console.error("Error loading categories for Megamenu:", err);
            }
        };
        if (isOpen) loadCategories();
    }, [isOpen]);

    const parents = categories.filter(c => !c.parent_id);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute top-full left-0 w-full bg-cream border-b border-gold/20 shadow-2xl z-40 overflow-hidden flex flex-col max-h-[85vh]"
                    onMouseEnter={onOpen}
                    onMouseLeave={onClose}
                >
                    <div className="max-w-[1700px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 w-full overflow-y-auto custom-scrollbar">
                        {parents.map((parent) => (
                            <div key={parent.id} className="group/parent p-8 lg:p-10 border-r border-b border-gold/10 hover:bg-white transition-all duration-500 flex flex-col">
                                <div className="space-y-4 flex-grow">
                                    {/* Temporarily hidden image
                                    <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative shadow-md">
                                        <img
                                            src={parent.image_url || '/placeholder.jpg'}
                                            alt={parent.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover group-hover/parent:scale-105 transition-transform duration-1000 opacity-90 group-hover/parent:opacity-100"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-cream/30 to-transparent" />
                                    </div>
                                    */}

                                    <h4 className="text-[11px] uppercase tracking-[0.4em] text-gold font-bold flex justify-between items-center group-hover/parent:text-chocolate transition-colors">
                                        {parent.name}
                                        <span className="w-4 h-[1px] bg-gold/40 group-hover/parent:w-8 transition-all duration-500" />
                                    </h4>

                                    {parent.description && (
                                        <p className="text-[10px] text-chocolate/40 italic leading-relaxed font-light line-clamp-2">
                                            {parent.description}
                                        </p>
                                    )}

                                    <ul className="space-y-3 pt-4 border-t border-gold/5">
                                        {categories
                                            .filter(child => child.parent_id === parent.id)
                                            .map((child) => (
                                                <li key={child.id}>
                                                    <Link
                                                        to={`/catalogo?categoria=${parent.slug}&subcategoria=${child.slug}`}
                                                        className="text-[12.5px] text-chocolate/60 hover:text-gold transition-all duration-300 font-light block group/item flex items-center gap-3"
                                                        onClick={onClose}
                                                    >
                                                        <div className="w-1.5 h-1.5 rounded-full border border-gold/30 group-hover/item:scale-125 group-hover/item:bg-gold transition-all duration-300" />
                                                        {child.name}
                                                    </Link>
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>

                                <Link
                                    to={`/catalogo?categoria=${parent.slug}`}
                                    className="pt-8 mt-auto block text-[9px] uppercase tracking-widest font-bold text-chocolate/30 hover:text-gold transition-colors inline-flex items-center gap-2 group/all"
                                    onClick={onClose}
                                >
                                    Explorar Colección
                                    <span className="group-hover/all:translate-x-1.5 transition-transform">→</span>
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white h-14 flex items-center justify-center px-12 border-t border-gold/10 relative">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                        <p className="text-[8px] md:text-[9px] uppercase tracking-[0.6em] text-chocolate/30 italic relative z-10 flex items-center gap-4">
                            <span className="w-8 h-[1px] bg-gold/20" />
                            Cada pieza cuenta una historia de fe y tradición • Arcángel Ceremonias
                            <span className="w-8 h-[1px] bg-gold/20" />
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
