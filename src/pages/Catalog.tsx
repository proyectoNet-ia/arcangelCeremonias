import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '@/components/catalog/ProductCard';
import { productService } from '@/services/productService';
import { Product, Category } from '@/types/product';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faFilter, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Megamenu } from '@/components/layout/Megamenu';

const Catalog: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryQuery = searchParams.get('categoria');
    const subcategoryQuery = searchParams.get('subcategoria');

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMegamenuOpen, setIsMegamenuOpen] = useState(false);

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
        setSelectedSubcategory(null); // Clear subcategory when main category is changed
        if (categoryId) {
            const cat = categories.find(c => c.id === categoryId);
            if (cat) setSearchParams({ categoria: cat.slug });
        } else {
            setSearchParams({});
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true;
        const matchesSubcategory = selectedSubcategory ? p.subcategory === selectedSubcategory : true;
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.material?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        return matchesCategory && matchesSubcategory && matchesSearch;
    });

    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeed = async () => {
        try {
            setIsSeeding(true);
            const { seedCatalog } = await import('@/services/seedData');
            const success = await seedCatalog();
            if (success) {
                alert('¡Datos cargados con éxito!');
                window.location.reload();
            } else {
                alert('Error al cargar datos. Revisa la consola.');
            }
        } catch (error) {
            console.error('Seed error:', error);
            alert('Error crítico al cargar datos.');
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div className="min-h-screen bg-cream font-sans text-chocolate selection:bg-gold/20">
            {/* --- PREMIUM NAVBAR --- */}
            <header className="fixed top-0 w-full z-50 bg-cream/90 backdrop-blur-md border-b border-gold/10 px-6 py-4 md:px-12">
                <div className="max-w-[1600px] mx-auto flex justify-between items-center">
                    <Link to="/" className="w-28 md:w-36 hover:scale-105 transition-transform duration-500">
                        <Logo />
                    </Link>
                    <nav className="hidden md:flex gap-12 text-[10px] uppercase tracking-[0.3em] font-medium h-full">
                        <Link to="/" className="hover:text-gold transition-colors flex items-center">Inicio</Link>
                        <div
                            className="relative h-full flex items-center group cursor-pointer"
                            onMouseEnter={() => setIsMegamenuOpen(true)}
                        >
                            <span className={`${isMegamenuOpen ? 'text-gold' : 'text-chocolate'} group-hover:text-gold transition-colors flex items-center gap-2`}>
                                Colección <FontAwesomeIcon icon={faChevronDown} className={`text-[8px] transition-transform duration-300 ${isMegamenuOpen ? 'rotate-180' : ''}`} />
                            </span>
                        </div>
                        <Link to="#" className="hover:text-gold transition-colors opacity-40 cursor-not-allowed flex items-center">Nosotros</Link>
                    </nav>
                    <div className="md:hidden">
                        {/* Mobile Menu Icon (Placeholder) */}
                        <div className="w-6 h-[1px] bg-chocolate mb-1.5"></div>
                        <div className="w-6 h-[1px] bg-chocolate"></div>
                    </div>
                </div>

                <Megamenu
                    isOpen={isMegamenuOpen}
                    onClose={() => setIsMegamenuOpen(false)}
                />
            </header>

            {/* --- HERO SECTION --- */}
            <section className="pt-40 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
                <div className="flex flex-col gap-12 mb-16">
                    {/* TOP ROW: LOGO/STATUS & SEARCH */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-4">
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="block text-[10px] uppercase tracking-[0.4em] text-gold font-semibold"
                            >
                                Exclusividad & Elegancia
                            </motion.span>
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-5xl md:text-8xl font-serif leading-[1.1]"
                            >
                                Nuestro Catálogo <br />
                                <span className="italic text-gold/80 font-light">Editorial</span>
                            </motion.h1>
                        </div>

                        {/* Search Bar aligned to the top right */}
                        <div className="relative w-full md:max-w-sm md:mt-2">
                            <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold text-sm" />
                            <input
                                type="text"
                                placeholder="Buscar modelo o colección..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/80 backdrop-blur-md border border-gold/30 px-12 py-4 text-[11px] uppercase tracking-[0.2em] focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all duration-300 placeholder:text-chocolate/40 shadow-sm"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-chocolate/40 hover:text-gold transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="text-xs" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Botón temporal de desarrollo */}
                    {!loading && (
                        <div className="-mt-8">
                            <button
                                onClick={handleSeed}
                                disabled={isSeeding}
                                className={`text-[9px] uppercase tracking-widest text-gold hover:underline ${isSeeding ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSeeding ? '↻ Cargando datos...' : '↻ Actualizar catálogo a versión robusta (Supabase)'}
                            </button>
                        </div>
                    )}

                    {/* CATEGORY FILTER - Now solo and clean */}
                    <div className="flex flex-wrap gap-3 items-center border-t border-gold/10 pt-12">
                        <button
                            onClick={() => handleCategoryClick(null)}
                            className={`text-[10px] uppercase tracking-[0.2em] px-8 py-3 border transition-all duration-300 ${!selectedCategory ? 'bg-chocolate text-cream border-chocolate' : 'border-chocolate/20 text-chocolate/60 hover:border-chocolate'}`}
                        >
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`text-[10px] uppercase tracking-[0.2em] px-8 py-3 border transition-all duration-300 ${selectedCategory === cat.id ? 'bg-chocolate text-cream border-chocolate' : 'border-chocolate/20 text-chocolate/60 hover:border-chocolate'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- PRODUCT GRID --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
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

            {/* --- PREMIUM FOOTER --- */}
            <footer className="bg-chocolate text-cream pt-24 pb-12 px-6 md:px-12 mt-20">
                <div className="max-w-[1600px] mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 border-b border-cream/10 pb-20 mb-12">
                        <div className="col-span-1 md:col-span-1">
                            <div className="w-32 invert mb-8">
                                <Logo />
                            </div>
                            <p className="text-sm text-cream/60 leading-relaxed font-light">
                                Dedicados a la creación de piezas únicas para los momentos más sagrados de la vida.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-gold">Ubicación</h4>
                            <p className="text-sm text-cream/60 font-light italic">La Piedad, Michoacán, MX.</p>
                        </div>
                        <div>
                            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-gold">Contacto</h4>
                            <p className="text-sm text-cream/60 font-light">352 168 1197</p>
                            <p className="text-sm text-cream/60 font-light">ceremoniasarcangel@gmail.com</p>
                        </div>
                        <div>
                            <h4 className="text-[10px] uppercase tracking-[0.3em] font-bold mb-6 text-gold">Social</h4>
                            <div className="flex gap-6 text-cream/40">
                                <a href="#" className="hover:text-gold transition-colors">Instagram</a>
                                <a href="#" className="hover:text-gold transition-colors">Facebook</a>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-cream/30">
                            © 2026 Arcángel Ceremonias
                        </span>
                        <div className="flex gap-8 text-[10px] uppercase tracking-[0.3em] text-cream/30">
                            <a href="#" className="hover:text-cream transition-colors">Privacidad</a>
                            <a href="#" className="hover:text-cream transition-colors">Términos</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Catalog;
