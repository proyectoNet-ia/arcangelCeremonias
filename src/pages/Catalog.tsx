import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/catalog/ProductCard';
import { productService } from '@/services/productService';
import { Product, Category } from '@/types/product';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Logo } from '@/components/Logo';
import { RevealOnScroll } from '@/components/common/RevealOnScroll';
import { trackSearch } from '@/services/cookieService';

const Catalog: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryQuery = searchParams.get('categoria');
    const subcategoryQuery = searchParams.get('subcategoria');

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [isMegamenuOpen, setIsMegamenuOpen] = useState(false);

    useEffect(() => {
        const queryTerm = searchParams.get('search');
        if (queryTerm !== null) {
            setSearchTerm(queryTerm);
            // Track the search in cookies if non-empty
            if (queryTerm.trim().length >= 2) trackSearch(queryTerm.trim());
        }
    }, [searchParams]);

    // --- Drag to Scroll Logic for PC ---
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productsData, categoriesData] = await Promise.all([
                    productService.getProducts(),
                    productService.getCategories()
                ]);
                setProducts(productsData);
                setCategories(categoriesData);

                // Match category and subcategory from URL
                if (categoryQuery) {
                    const matchedCat = categoriesData.find(c => c.slug === categoryQuery);
                    if (matchedCat) {
                        setSelectedCategory(matchedCat.id);
                        if (subcategoryQuery) {
                            setSelectedSubcategory(subcategoryQuery);
                        } else {
                            setSelectedSubcategory(null);
                        }
                    }
                } else {
                    setSelectedCategory(null);
                    setSelectedSubcategory(null);
                }
            } catch (error) {
                console.error('Error fetching catalog data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryQuery, subcategoryQuery]);

    const handleCategoryClick = (categoryId: string | null) => {
        setSelectedCategory(categoryId);
        setSelectedSubcategory(null);

        const newParams: any = {};
        const currentSearch = searchParams.get('search');
        if (currentSearch) newParams.search = currentSearch;

        if (categoryId) {
            const cat = categories.find(c => c.id === categoryId);
            if (cat) newParams.categoria = cat.slug;
        }
        setSearchParams(newParams);
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
        const matchesSubcategory = selectedSubcategory ? p.subcategory === selectedSubcategory : true;

        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = !searchTerm ||
            p.name.toLowerCase().includes(searchLower) ||
            (p.model_code?.toLowerCase().includes(searchLower) ?? false) ||
            (p.material?.toLowerCase().includes(searchLower) ?? false) ||
            (p.subcategory?.toLowerCase().includes(searchLower) ?? false) ||
            (p.description?.toLowerCase().includes(searchLower) ?? false);

        return matchesCategory && matchesSubcategory && matchesSearch;
    });



    return (
        <div className="min-h-screen bg-cream font-sans text-chocolate selection:bg-gold/20">
            <Header />

            {/* --- HERO SECTION --- */}
            <section className="pt-32 md:pt-48 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
                <div className="flex flex-col gap-12 mb-16">
                    {/* TOP ROW: LOGO/STATUS & SEARCH */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <RevealOnScroll direction="right" className="space-y-4">
                            <span className="block text-[10px] uppercase tracking-[0.4em] text-gold font-semibold">
                                Ceremonias que se visten de elegancia
                            </span>
                            <h1 className="text-4xl md:text-8xl font-serif leading-[1.1]">
                                Nuestro Catálogo <br />
                                <span className="italic text-gold/80 font-light">Editorial</span>
                            </h1>
                        </RevealOnScroll>

                        {/* Search Bar aligned to the top right */}
                        <RevealOnScroll direction="left" delay={0.3} className="relative w-full md:max-w-sm md:mt-2 group">
                            <input
                                type="text"
                                placeholder="Buscar modelo o colección..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/80 backdrop-blur-md border border-gold/30 px-12 py-4 text-[11px] uppercase tracking-[0.2em] focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-300 placeholder:text-chocolate/40 shadow-sm"
                            />
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate text-base z-10 pointer-events-none group-focus-within:text-gold transition-colors"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolate/40 hover:text-gold transition-colors z-10"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                </button>
                            )}
                        </RevealOnScroll>
                    </div>



                    {/* CATEGORY NAV - Optimized for Scalability & Mobile */}
                    <RevealOnScroll direction="up" delay={0.5} className="space-y-6 border-t border-gold/10 pt-10">
                        {/* Parent Categories - Horizontal Scroll on Mobile & Drag on PC */}
                        <div className="flex items-center gap-4">
                            <div
                                ref={scrollRef}
                                onMouseDown={handleMouseDown}
                                onMouseLeave={handleMouseLeave}
                                onMouseUp={handleMouseUp}
                                onMouseMove={handleMouseMove}
                                className={`overflow-x-auto pb-4 -mb-4 flex gap-3 no-scrollbar mask-fade-right w-full cursor-grab active:cursor-grabbing select-none pr-12 md:pr-32`}
                            >
                                <button
                                    onClick={() => handleCategoryClick(null)}
                                    className={`whitespace-nowrap text-[11px] uppercase tracking-[0.2em] px-8 py-3.5 border transition-all duration-300 font-medium flex-shrink-0 ${!selectedCategory ? 'bg-chocolate text-cream border-chocolate shadow-lg' : 'border-chocolate/10 text-chocolate/70 hover:border-chocolate/40 hover:text-chocolate'}`}
                                >
                                    Todos
                                </button>
                                {categories.filter(c => !c.parent_id).map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategoryClick(cat.id)}
                                        className={`whitespace-nowrap text-[11px] uppercase tracking-[0.2em] px-8 py-3.5 border transition-all duration-300 font-medium flex-shrink-0 ${selectedCategory === cat.id ? 'bg-chocolate text-cream border-chocolate shadow-lg' : 'border-chocolate/10 text-chocolate/70 hover:border-chocolate/40 hover:text-chocolate'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                                {/* Spacer for mask safety */}
                                <div className="w-20 flex-shrink-0" />
                            </div>
                        </div>

                        {/* Subcategories - Refined Chips (Only if parent selected) */}
                        <AnimatePresence mode="wait">
                            {selectedCategory && categories.some(c => c.parent_id === selectedCategory) && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-wrap gap-2.5 pt-2"
                                >
                                    <button
                                        onClick={() => {
                                            setSelectedSubcategory(null);
                                            const cat = categories.find(c => c.id === selectedCategory);
                                            if (cat) setSearchParams({ categoria: cat.slug });
                                        }}
                                        className={`text-[10px] uppercase tracking-widest px-5 py-2 rounded-full border transition-all font-medium ${!selectedSubcategory ? 'bg-gold/15 border-gold text-chocolate shadow-sm' : 'border-chocolate/10 text-chocolate/50 hover:border-gold/30 hover:text-gold'}`}
                                    >
                                        Ver Todo {categories.find(c => c.id === selectedCategory)?.name}
                                    </button>
                                    {categories
                                        .filter(c => c.parent_id === selectedCategory)
                                        .map((sub) => (
                                            <button
                                                key={sub.id}
                                                onClick={() => {
                                                    setSelectedSubcategory(sub.slug);
                                                    const cat = categories.find(c => c.id === selectedCategory);
                                                    if (cat) setSearchParams({ categoria: cat.slug, subcategoria: sub.slug });
                                                }}
                                                className={`text-[10px] uppercase tracking-widest px-5 py-2 rounded-full border transition-all font-medium ${selectedSubcategory === sub.slug ? 'bg-gold/15 border-gold text-chocolate shadow-sm' : 'border-chocolate/10 text-chocolate/50 hover:border-gold/30 hover:text-gold'}`}
                                            >
                                                {sub.name}
                                            </button>
                                        ))
                                    }
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </RevealOnScroll>
                </div>

                {/* --- PRODUCT GRID --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 md:gap-x-8 gap-y-10 md:gap-y-16">
                    <AnimatePresence mode='popLayout'>
                        {loading ? (
                            // SKELETON LOADERS
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={`skeleton-${i}`} className="space-y-4 animate-pulse">
                                    <div className="bg-chocolate/5 aspect-[3/4] w-full" />
                                    <div className="h-4 bg-chocolate/5 w-3/4" />
                                    <div className="h-3 bg-chocolate/5 w-1/2" />
                                </div>
                            ))
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((product, index) => (
                                <ProductCard key={product.id} product={product} index={index} />
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="col-span-full py-20 text-center space-y-4"
                            >
                                <p className="font-serif text-2xl text-chocolate/40 italic">No se encontraron piezas que coincidan con tu búsqueda</p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        handleCategoryClick(null);
                                    }}
                                    className="text-[10px] uppercase tracking-widest text-gold hover:underline"
                                >
                                    Limpiar todos los filtros
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Catalog;
