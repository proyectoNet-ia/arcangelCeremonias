import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '@/components/Logo';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/components/catalog/ProductCard';
import { productService } from '@/services/productService';
import { Product, Category } from '@/types/product';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faFilter } from '@fortawesome/free-solid-svg-icons';
import { Megamenu } from '@/components/layout/Megamenu';

const Catalog: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
            } catch (error) {
                console.error('Error fetching catalog data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredProducts = selectedCategory
        ? products.filter(p => p.category_id === selectedCategory)
        : products;

    const handleSeed = async () => {
        const { seedCatalog } = await import('@/services/seedData');
        const success = await seedCatalog();
        if (success) window.location.reload();
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
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4 max-w-2xl">
                        <motion.span
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="block text-[10px] uppercase tracking-[0.4em] text-gold font-semibold"
                        >
                            Exclusividad & Elegancia
                        </motion.span>
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-5xl md:text-7xl font-serif leading-tight"
                        >
                            Nuestro Catálogo <br />
                            <span className="italic text-gold/80">Editorial</span>
                        </motion.h1>
                        {products.length === 0 && !loading && (
                            <button
                                onClick={handleSeed}
                                className="mt-4 text-[9px] uppercase tracking-widest text-gold hover:underline"
                            >
                                + Inicializar catálogo de prueba (Supabase)
                            </button>
                        )}
                    </div>

                    {/* CATEGORY FILTER */}
                    <div className="flex flex-wrap gap-4 items-center">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`text-[10px] uppercase tracking-[0.2em] px-6 py-2 border transition-all duration-300 ${!selectedCategory ? 'bg-chocolate text-cream border-chocolate' : 'border-chocolate/20 text-chocolate/60 hover:border-chocolate'}`}
                        >
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`text-[10px] uppercase tracking-[0.2em] px-6 py-2 border transition-all duration-300 ${selectedCategory === cat.id ? 'bg-chocolate text-cream border-chocolate' : 'border-chocolate/20 text-chocolate/60 hover:border-chocolate'}`}
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
                            <div className="col-span-full py-20 text-center">
                                <p className="font-serif text-2xl text-chocolate/40 italic">No se encontraron productos en esta categoría.</p>
                            </div>
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
