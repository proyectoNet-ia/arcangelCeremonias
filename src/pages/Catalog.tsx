import React, { useEffect, useState } from 'react';
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
            <Header />

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
                                Ceremonias que se visten de elegancia
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
                        <div className="relative w-full md:max-w-sm md:mt-2 group">
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

            <Footer />
        </div>
    );
};

export default Catalog;
