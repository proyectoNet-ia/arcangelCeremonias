import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { Category } from '../../types/product';

export const Megamenu: React.FC<{ isOpen: boolean; onClose: () => void; onOpen: () => void }> = ({ isOpen, onClose, onOpen }) => {
    const [allCategories, setAllCategories] = useState<Category[]>([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await productService.getCategories();
                setAllCategories(data);
            } catch (err) {
                console.error("Error loading categories for Megamenu:", err);
            }
        };
        if (isOpen && allCategories.length === 0) loadCategories();
    }, [isOpen, allCategories.length]);

    const getSortIndex = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('traje')) return 1;
        if (lower.includes('guayabera')) return 2;
        if (lower.includes('túnica') || lower.includes('tunica')) return 3;
        return 999;
    };

    const parentCategories = allCategories
        .filter(c => !c.parent_id)
        .sort((a, b) => getSortIndex(a.name) - getSortIndex(b.name));

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                    className="absolute top-[calc(100%-5px)] left-0 -translate-x-4 w-72 bg-white/95 backdrop-blur-xl border border-gold/20 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[100] overflow-visible"
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
                            {parentCategories.map((category) => {
                                const subcategories = allCategories.filter(c => c.parent_id === category.id);
                                return (
                                <div key={category.id} className="group/item relative">
                                    <Link
                                        to={`/catalogo?categoria=${category.slug}`}
                                        className="flex items-center justify-between px-6 py-3.5 hover:bg-gold/5 transition-all duration-300 border-b border-gold/5 last:border-none relative overflow-hidden"
                                        onClick={onClose}
                                    >
                                        <div className="flex items-center gap-4 relative">
                                            <div className="w-1.5 h-1.5 rounded-full border border-gold/30 group-hover/item:bg-gold group-hover/item:scale-125 transition-all duration-500" />
                                            <div className="relative">
                                                <span className="text-[11px] uppercase tracking-[0.2em] text-chocolate/70 group-hover/item:text-chocolate group-hover/item:translate-x-1 transition-all duration-500 font-medium block">
                                                    {category.name}
                                                </span>
                                                {/* Submenu Underline */}
                                                <div className="absolute -bottom-1 left-0 w-0 h-[1px] bg-gold group-hover/item:w-full transition-all duration-500 ease-out" />
                                            </div>
                                        </div>
                                        <div className={`transition-all duration-500 ${subcategories.length > 0 ? 'opacity-100 text-gold group-hover/item:translate-x-1' : 'opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0'}`}>
                                            <span className="text-[10px]">→</span>
                                        </div>
                                    </Link>

                                    {/* Flyout Submenu */}
                                    {subcategories.length > 0 && (
                                        <div className="absolute left-full top-0 w-64 bg-white/95 backdrop-blur-xl border border-gold/20 border-l-0 shadow-[15px_15px_40px_rgba(0,0,0,0.12)] opacity-0 invisible group-hover/item:opacity-100 group-hover/item:visible transition-all duration-300 z-50 transform -translate-x-2 group-hover/item:translate-x-0 before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/50 before:to-transparent before:pointer-events-none">
                                            <div className="py-3">
                                                {subcategories.map(sub => (
                                                    <Link
                                                        key={sub.id}
                                                        to={`/catalogo?categoria=${category.slug}&subcategoria=${sub.slug}`}
                                                        className="group/sub flex items-center gap-3 px-6 py-2.5 hover:bg-gold/5 transition-all duration-300"
                                                        onClick={onClose}
                                                    >
                                                        <div className="w-1 h-1 rounded-full bg-gold/30 group-hover/sub:bg-gold group-hover/sub:scale-150 transition-all duration-300" />
                                                        <span className="text-[10px] uppercase tracking-[0.15em] text-chocolate/70 group-hover/sub:text-chocolate group-hover/sub:translate-x-1 transition-all duration-300 font-medium block">
                                                            {sub.name}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                );
                            })}
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
