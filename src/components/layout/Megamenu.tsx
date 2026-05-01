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
                // Solo categorías principales
                setCategories(data.filter(c => !c.parent_id));
            } catch (err) {
                console.error("Error loading categories for Megamenu:", err);
            }
        };
        if (isOpen) loadCategories();
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute top-[calc(100%-5px)] left-1/2 -translate-x-1/2 w-72 bg-white/95 backdrop-blur-xl border border-gold/20 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] overflow-hidden"
                    onMouseEnter={onOpen}
                    onMouseLeave={onClose}
                >
                    {/* Decorative Top Line */}
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
                    
                    <div className="py-4">
                        <div className="px-6 py-2 mb-2">
                            <span className="text-[9px] uppercase tracking-[0.4em] text-gold font-bold">Nuestras Líneas</span>
                        </div>
                        
                        <div className="flex flex-col">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    to={`/catalogo?categoria=${category.slug}`}
                                    className="group flex items-center justify-between px-6 py-3.5 hover:bg-gold/5 transition-all duration-300 border-b border-gold/5 last:border-none relative overflow-hidden"
                                    onClick={onClose}
                                >
                                    <div className="flex items-center gap-4 relative">
                                        <div className="w-1.5 h-1.5 rounded-full border border-gold/30 group-hover:bg-gold group-hover:scale-125 transition-all duration-500" />
                                        <div className="relative">
                                            <span className="text-[11px] uppercase tracking-[0.2em] text-chocolate/70 group-hover:text-chocolate group-hover:translate-x-1 transition-all duration-500 font-medium block">
                                                {category.name}
                                            </span>
                                            {/* Submenu Underline */}
                                            <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold group-hover:w-full transition-all duration-500 ease-out" />
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500">
                                        <span className="text-gold text-[10px]">→</span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* View All Option */}
                        <Link
                            to="/catalogo"
                            className="mt-4 mx-6 flex items-center justify-center gap-2 py-3 border border-gold/20 text-[9px] uppercase tracking-[0.3em] font-bold text-chocolate hover:bg-chocolate hover:text-white transition-all duration-500"
                            onClick={onClose}
                        >
                            Ver Todo el Catálogo
                        </Link>
                    </div>

                    {/* Premium Footer Accent */}
                    <div className="bg-chocolate/5 py-3 px-6 flex justify-center items-center">
                        <p className="text-[7px] uppercase tracking-[0.5em] text-gold/60 italic">
                            Arcángel Ceremonias
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
