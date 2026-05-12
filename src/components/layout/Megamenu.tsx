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
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-[calc(100%-1px)] left-1/2 -translate-x-1/2 w-[320px] bg-white/98 backdrop-blur-2xl border border-gold/10 shadow-[0_40px_100px_rgba(62,39,35,0.08)] z-[100] overflow-hidden rounded-sm"
                    onMouseEnter={onOpen}
                    onMouseLeave={onClose}
                >
                    {/* Premium Top Golden Accent */}
                    <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gold/80 to-transparent opacity-60" />
                    
                    <div className="py-6">
                        <div className="px-8 pb-4 border-b border-gold/10 mb-2">
                            <span className="text-[9px] uppercase tracking-[0.5em] text-chocolate/40 font-bold block text-center">Colección Exclusiva</span>
                        </div>
                        
                        <div className="flex flex-col">
                            {categories.map((category, idx) => (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + idx * 0.05, duration: 0.5, ease: 'easeOut' }}
                                >
                                    <Link
                                        to={`/catalogo?categoria=${category.slug}`}
                                        className="group flex items-center justify-between px-8 py-4 hover:bg-gold/5 transition-all duration-500 relative overflow-hidden"
                                        onClick={onClose}
                                    >
                                        <div className="flex items-center gap-5 relative z-10">
                                            {/* Elegant Diamond Bullet */}
                                            <div className="w-1.5 h-1.5 rotate-45 border border-gold/40 group-hover:bg-gold group-hover:scale-110 group-hover:border-gold transition-all duration-500" />
                                            <div className="relative">
                                                <span className="text-[11px] uppercase tracking-[0.25em] text-chocolate/80 group-hover:text-chocolate group-hover:translate-x-2 transition-transform duration-500 font-medium block">
                                                    {category.name}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 z-10">
                                            <span className="text-gold text-[10px] tracking-widest font-serif italic">Explorar</span>
                                        </div>
                                        
                                        {/* Premium subtle gradient background on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-gold/0 via-gold/[0.02] to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>

                        {/* View All Option */}
                        <div className="px-8 pt-6 mt-2 border-t border-gold/10">
                            <Link
                                to="/catalogo"
                                className="group flex items-center justify-center gap-3 py-3.5 bg-chocolate text-cream hover:bg-gold hover:text-white transition-all duration-500 rounded-sm overflow-hidden relative"
                                onClick={onClose}
                            >
                                <span className="text-[9px] uppercase tracking-[0.4em] font-bold relative z-10 transition-transform group-hover:scale-105 duration-500">
                                    Ver Colección Completa
                                </span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
