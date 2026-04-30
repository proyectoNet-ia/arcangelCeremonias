import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faChevronRight, faChevronLeft, faShareNodes, faDiamond, faHands, faTruckFast, faStore, faTag, faPalette, faLayerGroup, faScissors, faStar, faPhone, faRulerHorizontal, faTimes, faCertificate, faMap } from '@fortawesome/free-solid-svg-icons';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Logo } from '@/components/Logo';
import { ProductCard } from '@/components/catalog/ProductCard';
import { productService } from '@/services/productService';
import { Product } from '@/types/product';
import {
    trackProductView,
    trackCategoryView,
    getViewedProductSlugs,
    clearAllHistory
} from '@/services/cookieService';
import { useConfig } from '@/context/ConfigContext';
import { statsService } from '@/services/statsService';
import { CTABanner } from '@/components/common/CTABanner';
import { SEO } from '@/components/common/SEO';
import { ProductDetailSkeleton } from '@/components/common/Skeleton';

const ProductDetail: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [historyProducts, setHistoryProducts] = useState<Product[]>([]);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const { config } = useConfig();
    const whatsapp = config?.whatsapp || '523521681197';
    const phone = config?.phone || '352 52 62502';

    useEffect(() => {
        const fetchProduct = async () => {
            if (!slug) return;
            try {
                setLoading(true);
                const data = await productService.getProductBySlug(slug);
                setProduct(data);

                // Select first variant by default if variants exist
                if (data?.size_variants && data.size_variants.length > 0) {
                    setSelectedVariant(0);
                }

                // Track view via cookie (persists 30 days)
                trackProductView(slug);
                if (data?.category_id) trackCategoryView(data.category_id);

                // Fetch Related and History Products
                const allProducts = await productService.getProducts();

                // Related: Same category, different id
                const related = allProducts
                    .filter(p => p.category_id === data.category_id && p.id !== data.id)
                    .slice(0, 4);
                setRelatedProducts(related);

                // History: From cookie slugs (excluding current product)
                const historySlugs = getViewedProductSlugs(slug);
                const history = historySlugs
                    .map(s => allProducts.find(p => p.slug === s))
                    .filter(Boolean) as Product[];
                setHistoryProducts(history.slice(0, 4));

            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [slug]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomPos({ x, y });
    };

    if (loading) {
        return <ProductDetailSkeleton />;
    }

    if (!product || product.is_active === false) {
        return (
            <div className="min-h-screen bg-cream flex flex-col items-center justify-center space-y-6">
                <h2 className="font-serif text-3xl text-chocolate">Producto no encontrado</h2>
                <Link to="/catalogo" className="text-gold uppercase tracking-widest text-xs hover:underline underline-offset-4">
                    Volver al catálogo
                </Link>
            </div>
        );
    }

    const images = [product.main_image, ...(product.gallery || [])];
    const currentPrice = selectedVariant !== null && product.size_variants
        ? product.size_variants[selectedVariant].price
        : product.price;

    // ── Abre WhatsApp (mismo comportamiento en los 3 botones) ──────────────
    const waOpen = (msg: string) => {
        const phone = whatsapp.replace(/\D/g, ''); // solo dígitos, sin espacios ni guiones
        statsService.trackWhatsAppClick(window.location.href, product.id);
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
        window.open(url, 'whatsapp_contact', 'noopener,noreferrer');
    };

    // ── Mensaje detallado para el vendedor ──────────────────────────────
    const buildWhatsAppMessage = (context: 'interesa' | 'distribuidor' | 'asesoria' = 'interesa') => {
        const model = product.model_code || product.slug.toUpperCase();
        const color = product.color || 'No especificado';
        const mat = product.material || 'No especificado';
        const desc = product.description || '';
        const url = window.location.href;

        const showPrices = (config?.show_prices ?? true) && product.show_price;
        let tallaLinea = '';
        if (selectedVariant !== null && product.size_variants) {
            const v = product.size_variants[selectedVariant];
            const priceInfo = showPrices ? `\n*Precio:* $${v.price.toLocaleString('es-MX')} MXN` : '';
            tallaLinea = `*Talla seleccionada:* ${v.size}${priceInfo}`;
        } else if (product.sizes && product.sizes.length > 0) {
            tallaLinea = `*Tallas disponibles:* ${product.sizes.join(', ')}`;
        } else {
            tallaLinea = `*Tallas:* A consultar`;
        }

        const badge = context === 'distribuidor'
            ? '*Canal:* Distribuidor / Mayoreo'
            : context === 'asesoria'
                ? '*Canal:* Asesoría general'
                : '*Canal:* Cliente directo';

        return [
            `¡Hola! Me interesa el siguiente producto de *Arcángel Ceremonias*:`,
            ``,
            `-------------------------------------------`,
            `*Producto:* ${product.name}`,
            `*Modelo:* ${model}`,
            `*Color:* ${color}`,
            `*Material:* ${mat}`,
            tallaLinea,
            ``,
            `*Descripción:* ${desc}`,
            ``,
            `*Ver producto:* ${url}`,
            `-------------------------------------------`,
            badge,
            ``,
            `Por favor, ¿podrían darme más información sobre disponibilidad, tiempos de entrega y formas de pago?`,
        ].join('\n');
    };

    return (
        <div className="min-h-screen bg-cream font-sans text-chocolate selection:bg-gold/20">
            <SEO
                title={product.name}
                description={product.description}
                image={product.main_image}
                article={true}
            />
            <Header />

            <main>
                <section className="pt-24 md:pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
                    {/* Breadcrumb moved to top for better orientation */}
                    <nav className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.35em] text-chocolate/60 mb-8 md:mb-12 font-medium">
                        <Link to="/" className="hover:text-gold transition-colors">Inicio</Link>
                        <FontAwesomeIcon icon={faChevronRight} className="text-[6.5px]" />
                        <Link to="/catalogo" className="hover:text-gold transition-colors">Colección</Link>
                        <FontAwesomeIcon icon={faChevronRight} className="text-[6.5px]" />
                        <span className="text-gold font-semibold">{product.name}</span>
                    </nav>

                    {/* Editorial Product Name (Visible on mobile to fill the gap) */}
                    <div className="mb-10 lg:hidden">
                        <span className="block text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-2">Colección Editorial</span>
                        <h2 className="text-4xl font-serif text-chocolate leading-tight italic">
                            {product.name}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">

                        {/* Left: Image Gallery — slides in from left */}
                        <motion.div
                            className="lg:col-span-7 xl:col-span-7 space-y-4"
                            initial={{ opacity: 0, x: -40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        >
                            <div
                                className="relative w-full h-[500px] md:h-[800px] lg:h-[950px] overflow-hidden bg-white shadow-md cursor-zoom-in rounded-sm"
                                onMouseMove={handleMouseMove}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={activeImage}
                                        src={images[activeImage]}
                                        alt={product.name}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        style={{
                                            originX: `${zoomPos.x}%`,
                                            originY: `${zoomPos.y}%`
                                        }}
                                        whileHover={{ scale: 2 }}
                                        className="w-full h-full object-cover"
                                    />
                                </AnimatePresence>
                            </div>

                            {/* Thumbnails — stagger in */}
                            {images.length > 1 && (
                                <motion.div
                                    className="flex gap-4 overflow-x-auto pb-2 scrollbar-none"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                >
                                    {images.map((img, idx) => (
                                        <motion.button
                                            key={idx}
                                            onClick={() => setActiveImage(idx)}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.35, delay: 0.5 + idx * 0.07 }}
                                            whileHover={{ y: -3 }}
                                            className={`relative flex-shrink-0 w-24 aspect-[3/4] bg-white transition-all duration-300 ${activeImage === idx ? 'ring-1 ring-gold opacity-100' : 'opacity-40 hover:opacity-100'}`}
                                        >
                                            <img src={img} className="w-full h-full object-cover" alt="" />
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>

                        {/* Right: Product Details — slides in from right */}
                        <motion.div
                            className="lg:col-span-5 space-y-10 py-4"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                        >
                            {/* Breadcrumb + Name + Price */}
                            <motion.div
                                className="space-y-4"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.25 }}
                            >
                                <div className="hidden lg:block">
                                    <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-2 block">Detalles de la Pieza</span>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.35 }}
                                    className="space-y-6"
                                >
                                    <h1 className="text-3xl md:text-4xl xl:text-5xl font-serif text-chocolate leading-[1.2] tracking-wider uppercase">
                                        {product.name}
                                    </h1>
                                    <motion.div
                                        className="w-16 h-[1.5px] bg-gold/40"
                                        initial={{ scaleX: 0, originX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.7, delay: 0.55 }}
                                    />
                                </motion.div>

                                <motion.div
                                    className="flex items-center gap-6 pt-2"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                >
                                    {(config?.show_prices ?? true) && product.show_price && currentPrice ? (
                                        <span className="text-2xl font-sans text-gold">
                                            ${currentPrice.toLocaleString('es-MX')}
                                            {selectedVariant !== null && (
                                                <span className="text-[10px] uppercase tracking-widest text-chocolate/40 ml-4 font-bold">
                                                    Talla {product.size_variants?.[selectedVariant].size}
                                                </span>
                                            )}
                                        </span>
                                    ) : (
                                        <span className="text-sm uppercase tracking-widest text-gold italic font-medium">Precio bajo consulta</span>
                                    )}
                                    <div className="h-[1px] flex-grow bg-gold/20" />
                                </motion.div>
                            </motion.div>

                            {/* Size Selection */}
                            {product.size_variants && product.size_variants.length > 0 && (
                                <motion.div
                                    className="space-y-4"
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.6 }}
                                >
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-chocolate/40 font-bold block">Seleccionar Talla (El precio varía según la talla)</span>
                                    <div className="flex flex-wrap gap-3">
                                        {product.size_variants.map((v, idx) => (
                                            <motion.button
                                                key={idx}
                                                onClick={() => setSelectedVariant(idx)}
                                                initial={{ opacity: 0, scale: 0.88 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.3, delay: 0.65 + idx * 0.06 }}
                                                whileHover={{ y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                className={`px-6 py-3 text-xs uppercase tracking-widest transition-all duration-300 border ${selectedVariant === idx
                                                    ? 'bg-chocolate text-cream border-chocolate shadow-lg'
                                                    : 'border-gold/20 text-chocolate hover:border-gold opacity-60 hover:opacity-100'
                                                    }`}
                                            >
                                                {v.size}
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Size Guide Link (Mercado Libre Style) */}
                            {product && (product as any).categories?.size_guide_url && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="pt-2"
                                >
                                    <button
                                        onClick={() => setShowSizeGuide(true)}
                                        className="text-[10px] uppercase tracking-[0.2em] font-bold text-gold hover:text-chocolate transition-all flex items-center gap-2 group"
                                    >
                                        <FontAwesomeIcon icon={faRulerHorizontal} className="group-hover:rotate-12 transition-transform" />
                                        <span className="border-b border-gold/30 group-hover:border-chocolate pb-0.5">Guía de Tallas</span>
                                    </button>
                                </motion.div>
                            )}

                            {/* Product Technical Specs (Blocks) — staggered */}
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Modelo', value: product.model_code || product.slug.toUpperCase(), icon: faTag },
                                    { label: 'Color', value: product.color || 'Hueso', icon: faPalette },
                                    { label: 'Material', value: product.material || 'Organza Premium', icon: faLayerGroup },
                                    { label: 'Confección', value: product.sizes?.join(', ') || 'Tradicional', icon: faScissors }
                                ].map((attr, i) => (
                                    <motion.div
                                        key={i}
                                        className="bg-white/40 border border-gold/10 p-6 md:p-8 rounded-sm space-y-3 shadow-sm relative group hover:bg-white/90 transition-all duration-500 cursor-default"
                                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.45, delay: 0.7 + i * 0.1 }}
                                        whileHover={{ y: -4, boxShadow: '0 14px 40px rgba(139,100,60,0.09)' }}
                                    >
                                        <div className="flex items-center gap-3 text-gold/60">
                                            <FontAwesomeIcon icon={attr.icon} className="text-[10px]" />
                                            <span className="text-[9px] uppercase tracking-[0.3em] font-bold block">{attr.label}</span>
                                        </div>
                                        <p className="text-sm md:text-lg font-serif italic text-chocolate leading-tight">{attr.value}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Description */}
                            <motion.div
                                className="space-y-6"
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 1.15 }}
                            >
                                <p className="text-base text-chocolate/70 leading-relaxed font-light">
                                    {product.detailed_description || product.description}
                                </p>
                            </motion.div>

                            {/* Actions */}
                            <motion.div
                                className="pt-8 space-y-6"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 1.25 }}
                            >
                                <div className="flex gap-4">
                                    <motion.button
                                        whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(139,100,60,0.2)' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => waOpen(buildWhatsAppMessage('interesa'))}
                                        className="flex-grow bg-chocolate text-cream py-5 md:py-6 px-8 flex items-center justify-center gap-4 group transition-all duration-500 relative overflow-hidden"
                                    >
                                        <div className="relative z-10 flex items-center gap-4">
                                            <FontAwesomeIcon icon={faWhatsapp} className="text-xl group-hover:scale-110 transition-transform duration-500 text-gold" />
                                            <span className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-bold">Solicitar Información</span>
                                        </div>
                                        {/* Premium Background Layer */}
                                        <div className="absolute inset-0 bg-gold opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine" />
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.05, rotate: 4 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            if (navigator.share) {
                                                navigator.share({
                                                    title: `Arcángel Ceremonias - ${product.name}`,
                                                    text: `Mira este producto en Arcángel Ceremonias: ${product.name}`,
                                                    url: window.location.href,
                                                }).catch(console.error);
                                            } else {
                                                navigator.clipboard.writeText(window.location.href);
                                                alert('¡Enlace copiado al portapapeles!');
                                            }
                                        }}
                                        className="w-16 md:w-20 bg-white border border-gold/20 text-chocolate flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-500 hover:shadow-xl group"
                                        title="Compartir"
                                    >
                                        <FontAwesomeIcon icon={faShareNodes} className="text-lg group-hover:scale-110 transition-transform" />
                                    </motion.button>
                                </div>

                                {/* Trust badges */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10px] uppercase tracking-[0.2em] text-chocolate/70 font-semibold">
                                    {[
                                        { icon: faMap, label: 'Hecho en México' },
                                        { icon: faCertificate, label: 'Calidad Textil' }
                                    ].map((badge, i) => (
                                        <motion.div
                                            key={i}
                                            className="flex items-center gap-4 bg-white p-5 border border-gold/30 rounded-sm shadow-md hover:shadow-xl transition-all duration-500 group/badge"
                                            initial={{ opacity: 0, x: i % 2 === 0 ? -14 : 14 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.5, delay: 1.35 + i * 0.1 }}
                                            whileHover={{ scale: 1.02, backgroundColor: '#ffffff' }}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gold/5 flex items-center justify-center group-hover/badge:bg-gold/10 transition-colors">
                                                <FontAwesomeIcon icon={badge.icon} className="text-gold text-lg" />
                                            </div>
                                            <span className="text-chocolate font-bold tracking-[0.25em]">{badge.label}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Contact Section */}
                                <motion.div
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 1.55 }}
                                    className="bg-gold/[0.03] border border-dashed border-gold/30 p-8 rounded-sm space-y-6 relative overflow-hidden shadow-xl shadow-chocolate/5"
                                >
                                    {/* Header */}
                                    <div className="space-y-1">
                                        <span className="text-[9px] uppercase tracking-[0.4em] text-gold/50 font-bold">Asesoría Mayorista</span>
                                        <h3 className="text-sm uppercase tracking-[0.25em] font-bold text-chocolate/80 font-sans">Ventas al Mayoreo y Distribución</h3>
                                    </div>

                                    {/* Single Premium WhatsApp Button */}
                                    <motion.button
                                        whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(37,211,102,0.15)' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => waOpen(buildWhatsAppMessage('distribuidor'))}
                                        className="w-full flex items-center justify-between p-6 bg-white border border-gold/20 text-chocolate hover:border-[#25D366] transition-all duration-500 group relative overflow-hidden"
                                    >
                                        <div className="flex items-center gap-5 relative z-10">
                                            <div className="w-12 h-12 rounded-full bg-[#25D366]/5 flex items-center justify-center group-hover:bg-[#25D366] group-hover:text-white transition-all duration-500">
                                                <FontAwesomeIcon icon={faWhatsapp} className="text-xl text-[#25D366] group-hover:text-white transition-transform duration-500" />
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-[10px] uppercase tracking-[0.3em] font-bold text-chocolate/40 group-hover:text-[#25D366]/70 transition-colors">Contactar vía</span>
                                                <span className="block text-xs uppercase tracking-[0.4em] font-bold">WhatsApp Business</span>
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 relative z-10">
                                            <FontAwesomeIcon icon={faChevronRight} className="text-[#25D366]" />
                                        </div>
                                        {/* Subtle Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine" />
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>


                <section className="pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">

                    {/* --- RELATED & HISTORY SECTION --- */}
                    <div className="mt-40 space-y-32">
                        {/* Related Products */}
                        {relatedProducts.length > 0 && (
                            <section className="space-y-12">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gold/10 pb-10">
                                    <div className="space-y-4">
                                        <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Inspiración para tu Ceremonia</span>
                                        <h2 className="text-4xl md:text-5xl font-serif text-chocolate">Artículos Similares</h2>
                                    </div>
                                    <Link to="/catalogo" className="text-[10px] uppercase tracking-[0.3em] font-bold text-gold hover:text-chocolate transition-colors border-b border-gold/40 hover:border-chocolate pb-1">
                                        Explorar Toda la Colección
                                    </Link>
                                </div>
                                {/* Horizontal scroll on mobile, grid on desktop */}
                                <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar gap-6 lg:grid lg:grid-cols-4 lg:gap-10 -mx-6 px-6 md:mx-0 md:px-0">
                                    {relatedProducts.map((p, idx) => (
                                        <div key={p.id} className="min-w-[85%] sm:min-w-[280px] lg:min-w-0 snap-center">
                                            <ProductCard product={p} index={idx} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* History Products */}
                        {historyProducts.length > 0 && (
                            <section className="space-y-12">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gold/10 pb-10">
                                    <div className="space-y-4">
                                        <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold">Basado en tu búsqueda</span>
                                        <h2 className="text-4xl md:text-5xl font-serif text-chocolate">Vistos Recientemente</h2>
                                    </div>
                                    <button
                                        onClick={() => {
                                            clearAllHistory();
                                            setHistoryProducts([]);
                                        }}
                                        className="text-[9px] uppercase tracking-[0.2em] font-medium text-chocolate/40 hover:text-chocolate transition-colors"
                                    >
                                        Limpiar Historial
                                    </button>
                                </div>
                                {/* Horizontal scroll on mobile, grid on desktop */}
                                <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar gap-6 lg:grid lg:grid-cols-4 lg:gap-10 -mx-6 px-6 md:mx-0 md:px-0">
                                    {historyProducts.map((p, idx) => (
                                        <div key={p.id} className="min-w-[85%] sm:min-w-[280px] lg:min-w-0 snap-center">
                                            <ProductCard product={p} index={idx} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </section>
            </main>

            <CTABanner
                customTitle={config?.product_cta_title || "Encuentra la pieza perfecta"}
                customSubtitle={config?.product_cta_subtitle || " con nuestra ayuda"}
                customBody={config?.product_cta_body || "Nuestros asesores te ayudan a encontrar la pieza ideal para tu ocasión especial. Atención directa, sin compromiso."}
            />

            <Footer />

            {/* Size Guide Modal */}
            <AnimatePresence>
                {showSizeGuide && product && (product as any).categories?.size_guide_url && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSizeGuide(false)}
                            className="absolute inset-0 bg-slate-900/90 backdrop-blur-md cursor-zoom-out"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl bg-white shadow-2xl overflow-hidden rounded-sm"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-1 h-6 bg-gold" />
                                    <div>
                                        <h3 className="text-sm uppercase tracking-widest font-bold text-chocolate">Guía de Tallas</h3>
                                        <p className="text-[10px] text-chocolate/40 uppercase tracking-widest">Referencia para {(product as any).categories?.name}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSizeGuide(false)}
                                    className="w-10 h-10 flex items-center justify-center text-chocolate/40 hover:text-gold transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="text-xl" />
                                </button>
                            </div>
                            <div className="max-h-[80vh] overflow-y-auto bg-slate-50 p-4 md:p-8">
                                <img
                                    src={(product as any).categories.size_guide_url}
                                    alt="Guía de Tallas"
                                    className="w-full h-auto shadow-sm rounded-sm mx-auto"
                                />
                                <div className="mt-8 p-6 bg-gold/5 border border-gold/10 rounded-sm">
                                    <p className="text-[10px] text-chocolate/60 leading-relaxed font-medium uppercase tracking-widest text-center">
                                        * Las medidas son referenciales y pueden variar ligeramente según el modelo y material de la prenda.
                                        Para una asesoría personalizada, no dudes en contactarnos vía WhatsApp.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDetail;

