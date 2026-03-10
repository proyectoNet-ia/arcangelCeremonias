import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronRight, faChevronLeft,
    faHands, faTruckFast, faDiamond, faStore, faAward, faLeaf
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RevealOnScroll } from '@/components/common/RevealOnScroll';
import { ProductCard } from '@/components/catalog/ProductCard';
import { productService } from '@/services/productService';
import { heroService, HeroSlide } from '@/services/heroService';
import { Product } from '@/types/product';
import { useConfig } from '@/context/ConfigContext';
import { CTABanner } from '@/components/common/CTABanner';
import { SEO } from '@/components/common/SEO';
import bgDesktop from '@/assets/fondo-horizontal.jpeg';
import bgMobile from '@/assets/fondo-movil.jpg';
import bgDesktop2 from '@/assets/fondo-pc.jpg';

// ─── Static Hero Slides (Fallback) ───────────────────────────────────────────
const staticSlides = [
    {
        id: 0,
        bg: bgDesktop,
        bgMobile: bgMobile,
        tag: 'Colección 2026',
        title: ['Arte', 'Ceremonial'],
        subtitle: 'Piezas artesanales que visten los momentos más importantes de tu vida.',
        cta: { label: 'Explorar Colección', to: '/catalogo' },
        align: 'left' as const,
    },
    {
        id: 1,
        bg: bgDesktop2,
        bgMobile: bgMobile,
        tag: 'Hecho en México',
        title: ['Elegancia', 'Atemporal'],
        subtitle: 'Más de 30 años fabricando textiles ceremoniales con dedicación y talento artesanal.',
        cta: { label: 'Conocer la Empresa', to: '/nosotros' },
        align: 'left' as const,
    },
    {
        id: 2,
        bg: bgDesktop,
        bgMobile: bgMobile,
        tag: 'Ventas al Mayoreo',
        title: ['Precios', 'Exclusivos'],
        subtitle: 'Distribuidores y boutiques: consulta nuestros precios especiales para compras por volumen.',
        cta: { label: 'Contactar Ahora', to: '/contacto' },
        align: 'left' as const,
    },
];

// ─── Trust Badges ────────────────────────────────────────────────────────────
const badges = [
    { icon: faHands, label: 'Piezas Artesanales' },
    { icon: faAward, label: '+30 Años de Experiencia' },
    { icon: faTruckFast, label: 'Envío Asegurado' },
    { icon: faStore, label: 'Ventas al Mayoreo' },
    { icon: faLeaf, label: 'Materiales Premium' },
    { icon: faDiamond, label: 'Calidad Certificada' },
];

// ─── Values ─────────────────────────────────────────────────────────────────
const values = [
    { num: '30+', label: 'Años en el mercado' },
    { num: '500+', label: 'Modelos en catálogo' },
    { num: '100%', label: 'Fabricación nacional' },
    { num: '∞', label: 'Atención personalizada' },
];

const Home: React.FC = () => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [slides, setSlides] = useState<any[]>(staticSlides);
    const { config } = useConfig();

    const whatsapp = config?.whatsapp || '523521681197';
    const phone = config?.phone || '352 52 62502';
    const facebook = config?.facebook_url || 'https://www.facebook.com/arcangel.ceremonias/';
    const instagram = config?.instagram_url || 'https://www.instagram.com/ceremonias.arcangel/';
    const [trendingIndex, setTrendingIndex] = useState(0);


    // Auto-advance slider
    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setActiveSlide(prev => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    // Fetch Hero Slides from DB
    useEffect(() => {
        const loadHero = async () => {
            try {
                const data = await heroService.getSlides();
                if (data && data.length > 0) {
                    const mapped = data.map(s => ({
                        id: s.id,
                        bg: s.bg_url,
                        bgMobile: s.bg_mobile_url || s.bg_url,
                        tag: s.tag,
                        title: [s.title_1, s.title_2 || ''],
                        subtitle: s.subtitle,
                        cta: { label: s.cta_label, to: s.cta_link },
                        align: 'left' as const
                    }));
                    setSlides(mapped);
                    setActiveSlide(0); // Reset for safety
                }
            } catch (e) {
                console.error("Error loading dynamic slides:", e);
            }
        };
        loadHero();
    }, []);

    // Fetch featured products (first 8)
    useEffect(() => {
        const load = async () => {
            try {
                const data = await productService.getProducts();
                if (data) {
                    setProducts(data.slice(0, 8));
                }
            } catch (e: any) {
                console.error("Products load error:", e.message || e);
            } finally {
                setLoadingProducts(false);
            }
        };
        load();
    }, []);

    const prev = useCallback(() => setActiveSlide(p => (p - 1 + slides.length) % slides.length), [slides.length]);
    const next = useCallback(() => setActiveSlide(p => (p + 1) % slides.length), [slides.length]);


    const slide = slides[activeSlide] || slides[0];
    const alignClass = 'items-start text-left';

    return (
        <div className="relative min-h-screen bg-cream font-sans text-chocolate selection:bg-gold/20">
            <SEO
                title="Catálogo Exclusivo"
                description="Descubre nuestra colección artesanal de artículos ceremoniales: ropones, bautizos y comuniones con más de 30 años de tradición."
            />
            <Header />

            {/* 1. HERO SLIDER */}
            <section
                className="relative h-[90vh] w-full overflow-hidden"
                style={{ paddingTop: 'var(--header-height, 80px)' }}
            >

                {/* Background slides */}
                <AnimatePresence mode="sync">
                    <motion.div
                        key={`bg-${activeSlide}`}
                        className="absolute inset-0 z-0 overflow-hidden"
                        initial={{ opacity: 0, scale: 1.06 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: 'easeInOut' }}
                    >
                        {/* Desktop bg */}
                        <div
                            className="hidden md:block absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${slide.bg})` }}
                        />
                        {/* Mobile bg */}
                        <div
                            className="md:hidden absolute inset-0 bg-cover bg-right"
                            style={{ backgroundImage: `url(${slide.bgMobile})` }}
                        />
                        {/* Overlay layers */}
                        <div className="absolute inset-0 bg-black/80 md:bg-black/50" />
                        <div className="absolute inset-0 bg-chocolate/10 md:bg-chocolate/35 mix-blend-multiply md:block hidden" />
                        <div className="absolute inset-0 bg-gradient-to-t from-chocolate/95 via-chocolate/20 to-chocolate/40 md:from-chocolate/90 md:via-transparent md:to-chocolate/30" />
                        <div className="absolute inset-0 bg-gradient-to-r from-chocolate/80 via-transparent to-transparent hidden md:block" />
                    </motion.div>
                </AnimatePresence>


                {/* Noise texture */}
                <div className="absolute inset-0 z-[2] opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/marble-similar.png')]" />

                {/* Slide content */}
                <div className="relative z-10 h-full flex flex-col px-6 md:px-16 lg:px-24 xl:px-32">
                    {/* Text content - flex-1 with justify-center to center vertically */}
                    <div className={`flex-1 flex flex-col justify-center ${alignClass}`}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`content-${activeSlide}`}
                                className="flex flex-col gap-6 max-w-3xl"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.7, ease: 'easeOut' }}
                            >
                                {/* Tag */}
                                <motion.div
                                    className="flex items-center gap-3"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <div className="w-6 h-[2px] bg-gold" />
                                    <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold">
                                        {slide.tag}
                                    </span>
                                </motion.div>

                                {/* Title */}
                                <motion.h1
                                    className="font-serif text-cream leading-[0.95] tracking-tight"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <span className="block text-4xl xs:text-5xl md:text-7xl lg:text-8xl xl:text-9xl uppercase">
                                        {slide.title[0]}
                                    </span>
                                    <span className="block text-4xl xs:text-5xl md:text-7xl lg:text-8xl xl:text-9xl uppercase text-gold/80">
                                        {slide.title[1]}
                                    </span>
                                </motion.h1>

                                {/* Divider */}
                                <motion.div
                                    className="w-16 h-[1px] bg-gold/40"
                                    initial={{ scaleX: 0, originX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.35, duration: 0.6 }}
                                />

                                {/* Subtitle */}
                                <motion.p
                                    className="text-white md:text-cream/70 text-sm md:text-base font-light leading-relaxed max-w-md"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    {slide.subtitle}
                                </motion.p>

                                {/* CTA Button */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <Link
                                        to={slide.cta.to}
                                        className="inline-flex items-center gap-4 bg-gold text-chocolate px-7 py-3.5 md:px-8 md:py-4 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-cream transition-all duration-500 hover:shadow-2xl hover:shadow-gold/30 group"
                                    >
                                        {slide.cta.label}
                                        <FontAwesomeIcon icon={faChevronRight} className="text-[8px] group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Bottom controls */}
                    <div className="pb-8 md:pb-12 flex items-center justify-between text-cream/60">
                        {/* Slide indicators */}
                        <div className="flex items-center gap-3">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveSlide(i)}
                                    className={`transition-all duration-500 ${i === activeSlide ? 'w-10 h-[2px] bg-gold' : 'w-4 h-[1px] bg-white/15 hover:bg-white/40'}`}
                                />
                            ))}
                        </div>

                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════
                2. MARQUEE ANNOUNCEMENT (REEL DE TEXTO)
            ════════════════════════════════════════ */}
            <section className="bg-chocolate py-4 overflow-hidden border-b border-gold/20 relative z-20">
                <div className="flex whitespace-nowrap animate-marquee">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center">
                            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold px-12">
                                Fabricantes de Artículos Ceremoniales por más de 30 años
                            </span>
                            <FontAwesomeIcon icon={faDiamond} className="text-[8px] text-gold/40" />
                            <span className="text-[10px] uppercase tracking-[0.4em] text-cream font-medium px-12">
                                Envíos a todo México e Internacionales
                            </span>
                            <FontAwesomeIcon icon={faDiamond} className="text-[8px] text-gold/40" />
                            <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold px-12">
                                Atención Personalizada y Ventas al Mayoreo
                            </span>
                            <FontAwesomeIcon icon={faDiamond} className="text-[8px] text-gold/40" />
                        </div>
                    ))}
                </div>
            </section>

            {/* ════════════════════════════════════════
                3. FEATURED PRODUCTS
            {/* 3. FEATURED PRODUCTS */}
            <section className="relative pt-28 pb-20 md:pt-40 md:pb-32 px-6 md:px-12 max-w-[1600px] mx-auto overflow-hidden">
                <RevealOnScroll>
                    {/* Section header */}
                    <div className="section-header flex flex-col md:flex-row md:items-end justify-between border-b border-gold/10 pb-12">
                        <div>
                            <div className="section-header-tag-wrapper">
                                <div className="section-header-line" />
                                <span className="section-header-tag">Colección</span>
                            </div>
                            <h2 className="section-header-title">
                                Artículos<br />
                                <span className="section-header-highlight">Destacados</span>
                            </h2>
                        </div>
                        <Link
                            to="/catalogo"
                            className="group inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] font-bold text-chocolate/50 hover:text-chocolate transition-colors border-b border-gold/20 hover:border-chocolate pb-1"
                        >
                            Ver toda la colección
                            <FontAwesomeIcon icon={faChevronRight} className="text-[7px] group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Product grid / Mobile Carousel */}
                    {loadingProducts ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-chocolate/5 animate-pulse rounded-sm" />
                            ))}
                        </div>
                    ) : (
                        <div className="relative no-scrollbar">
                            <style>{`
                                .no-scrollbar::-webkit-scrollbar { display: none !important; }
                                .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
                            `}</style>
                            <div
                                className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10 overflow-x-auto md:overflow-visible pb-12 md:pb-0 no-scrollbar snap-x snap-mandatory px-4 md:px-0"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {products.map((product, idx) => (
                                    <div key={product.id} className="min-w-[85%] sm:min-w-[320px] md:min-w-0 md:w-auto snap-center">
                                        <ProductCard product={product} index={idx} />
                                    </div>
                                ))}
                            </div>

                            {/* Mobile Swipe Hint */}
                            <div className="flex md:hidden justify-center gap-2 mt-4">
                                {[...Array(Math.min(4, products.length))].map((_, i) => (
                                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-gold/20" />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Bottom CTA */}
                    <div className="flex justify-center mt-4">
                        <Link
                            to="/catalogo"
                            className="group inline-flex items-center gap-4 border border-gold/30 text-chocolate px-12 py-5 text-[9px] uppercase tracking-[0.4em] font-bold hover:bg-chocolate hover:text-cream hover:border-chocolate transition-all duration-500"
                        >
                            <FontAwesomeIcon icon={faStore} className="text-gold group-hover:text-gold text-sm" />
                            Explorar el Catálogo Completo
                        </Link>
                    </div>
                </RevealOnScroll>
            </section>


            {/* ════════════════════════════════════════
                4. BRAND PILLARS (TRUST & VALUE)
            ════════════════════════════════════════ */}
            <section className="relative py-20 md:py-32 bg-white/40 border-y border-gold/10 overflow-hidden">
                <div className="max-w-[1600px] mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8">
                        {/* Pilar 1: Materiales */}
                        <RevealOnScroll className="space-y-6 text-center" delay={0.1}>
                            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                                <div className="absolute inset-0 border border-gold/20 rotate-45 transform group-hover:rotate-90 transition-transform duration-700" />
                                <FontAwesomeIcon icon={faAward} className="text-2xl text-gold" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-chocolate">Fibras Naturales</h3>
                                <p className="text-[11px] text-chocolate/50 font-light leading-relaxed px-4">
                                    Seleccionamos los mejores linos y sedas para garantizar frescura y caída impecable.
                                </p>
                            </div>
                        </RevealOnScroll>

                        {/* Pilar 2: Experiencia */}
                        <RevealOnScroll className="space-y-6 text-center" delay={0.2}>
                            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                                <div className="absolute inset-0 border border-gold/20 rotate-45" />
                                <FontAwesomeIcon icon={faHands} className="text-2xl text-gold" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-chocolate">Maestría Textil</h3>
                                <p className="text-[11px] text-chocolate/50 font-light leading-relaxed px-4">
                                    Tres décadas perfeccionando procesos artesanales en cada puntada.
                                </p>
                            </div>
                        </RevealOnScroll>

                        {/* Pilar 3: Diseño */}
                        <RevealOnScroll className="space-y-6 text-center" delay={0.3}>
                            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                                <div className="absolute inset-0 border border-gold/20 rotate-45" />
                                <FontAwesomeIcon icon={faLeaf} className="text-2xl text-gold" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-chocolate">Legado Familiar</h3>
                                <p className="text-[11px] text-chocolate/50 font-light leading-relaxed px-4">
                                    Piezas diseñadas para trascender el tiempo y ser herencia familiar.
                                </p>
                            </div>
                        </RevealOnScroll>

                        {/* Pilar 4: Distribución */}
                        <RevealOnScroll className="space-y-6 text-center" delay={0.4}>
                            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                                <div className="absolute inset-0 border border-gold/20 rotate-45" />
                                <FontAwesomeIcon icon={faTruckFast} className="text-2xl text-gold" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold text-chocolate">Logística Global</h3>
                                <p className="text-[11px] text-chocolate/50 font-light leading-relaxed px-4">
                                    Envíos asegurados a todo México y atención prioritaria para boutiques.
                                </p>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </section>


            {/* ════════════════════════════════════════
                4.5 TRENDING CAROUSEL (LOS MÁS BUSCADOS)
            ════════════════════════════════════════ */}
            <section className="relative py-28 md:py-40 bg-cream/30 overflow-hidden">
                <div className="max-w-[1600px] mx-auto px-6 md:px-12">
                    <RevealOnScroll className="space-y-16">
                        {/* Header Left Aligned */}
                        <div className="section-header">
                            <div className="section-header-tag-wrapper">
                                <div className="section-header-line" />
                                <span className="section-header-tag">Selección</span>
                            </div>
                            <h2 className="section-header-title">
                                Piezas más <br />
                                <span className="section-header-highlight">deseadas</span>
                            </h2>
                        </div>

                        {/* Carousel Wrapper */}
                        <div className="relative">
                            {/* Navigation Buttons - Hidden on Mobile */}
                            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 -left-4 lg:-left-8 z-30">
                                <motion.button
                                    onClick={() => setTrendingIndex(prev => Math.max(0, prev - 1))}
                                    whileHover={{ scale: 1.1, x: -5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`w-14 h-14 rounded-full border border-gold/20 flex items-center justify-center text-gold backdrop-blur-md transition-all duration-300 ${trendingIndex === 0 ? 'opacity-20 cursor-not-allowed' : 'opacity-100 hover:bg-gold hover:text-white hover:border-gold'}`}
                                >
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </motion.button>
                            </div>
                            <div className="hidden md:block absolute top-1/2 -translate-y-1/2 -right-4 lg:-right-8 z-30">
                                <motion.button
                                    onClick={() => {
                                        const max = Math.max(0, products.slice(1, 9).length - 3);
                                        setTrendingIndex(prev => Math.min(max, prev + 1));
                                    }}
                                    whileHover={{ scale: 1.1, x: 5 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`w-14 h-14 rounded-full border border-gold/20 flex items-center justify-center text-gold backdrop-blur-md transition-all duration-300 ${trendingIndex >= Math.max(0, products.slice(1, 9).length - 3) ? 'opacity-20 cursor-not-allowed' : 'opacity-100 hover:bg-gold hover:text-white hover:border-gold'}`}
                                >
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </motion.button>
                            </div>

                            {/* Carousel Content */}
                            <div className="overflow-hidden no-scrollbar">
                                <style>{`
                                    .no-scrollbar::-webkit-scrollbar { display: none !important; }
                                    .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
                                `}</style>
                                <motion.div
                                    className="flex gap-10"
                                    animate={{ x: `calc(-${trendingIndex * 33.333}% - ${trendingIndex * 2.5}rem)` }}
                                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                >
                                    {products.length > 4 ? products.slice(1, 9).map((p, idx) => (
                                        <div
                                            key={idx}
                                            className="min-w-full md:min-w-[calc(33.333%-27px)]"
                                        >
                                            <ProductCard product={p} index={idx} />
                                        </div>
                                    )) : (
                                        <div className="text-center w-full py-20 text-chocolate/30 italic font-serif">
                                            Cargando tendencias...
                                        </div>
                                    )}
                                </motion.div>
                            </div>
                        </div>

                        {/* Link to catalog + Pagination lines */}
                        <div className="flex flex-col items-center gap-12">
                            <div className="flex gap-4">
                                {[...Array(Math.max(0, products.slice(1, 9).length - 2))].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setTrendingIndex(i)}
                                        className={`h-[1px] transition-all duration-700 ease-in-out ${i === trendingIndex ? 'w-16 bg-gold' : 'w-6 bg-gold/15 hover:bg-gold/30'}`}
                                    />
                                ))}
                            </div>

                            <Link
                                to="/catalogo"
                                className="group inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-bold text-gold hover:text-chocolate transition-all duration-500"
                            >
                                <span className="w-10 h-[1px] bg-gold/30 group-hover:w-16 transition-all" />
                                Ver Tendencias Completas
                                <span className="w-10 h-[1px] bg-gold/30 group-hover:w-16 transition-all" />
                            </Link>
                        </div>
                    </RevealOnScroll>
                </div>
            </section>

            {/* ════════════════════════════════════════
                5. EMPRESA INFO + VALORES
            ════════════════════════════════════════ */}
            {/* 5. EMPRESA INFO + VALORES */}
            <section className="relative py-28 md:py-40 px-6 md:px-12 max-w-[1600px] mx-auto overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 xl:gap-40 items-center">

                    {/* Left: Story */}
                    <RevealOnScroll className="space-y-10">
                        <div className="section-header !mb-10">
                            <div className="section-header-tag-wrapper">
                                <div className="section-header-line" />
                                <span className="section-header-tag">Nuestra Historia</span>
                            </div>
                            <h2 className="section-header-title !text-3xl !sm:text-4xl !md:text-5xl">
                                Más de 30 Años<br />
                                <span className="section-header-highlight uppercase">de Tradición</span>
                            </h2>
                        </div>
                        <div className="space-y-5 text-chocolate/65 text-sm font-light leading-relaxed">
                            <p>
                                En Arcángel Ceremonias llevamos más de tres décadas en el ramo textil, fabricando y manufacturando productos ceremoniales con la dedicación y talento de muchas personas comprometidas con la calidad.
                            </p>
                            <p>
                                Nuestra misión es ser líderes en la fabricación de productos ceremoniales para las nuevas generaciones, satisfaciendo las necesidades de nuestros clientes con calidad y a un precio justo.
                            </p>
                            <p>
                                Creemos firmemente en el comercio justo y en la vocación de servir con valores fundamentales: <strong className="text-chocolate font-medium">calidad, honradez, amabilidad</strong> y especial atención a los detalles.
                            </p>
                        </div>
                        <Link
                            to="/nosotros"
                            className="group inline-flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] font-bold text-gold hover:text-chocolate transition-colors border-b border-gold/30 hover:border-chocolate pb-1"
                        >
                            Conocer más sobre nosotros
                            <FontAwesomeIcon icon={faChevronRight} className="text-[7px] group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </RevealOnScroll>

                    {/* Right: Stats */}
                    <RevealOnScroll delay={0.2} className="grid grid-cols-2 gap-6">
                        {values.map((v, i) => (
                            <motion.div
                                key={i}
                                className="bg-white/60 border border-gold/10 p-8 md:p-10 space-y-3 hover:bg-white/90 transition-all duration-500 group cursor-default"
                                whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(139,100,60,0.10)' }}
                            >
                                <div className="font-serif text-4xl md:text-5xl text-gold leading-none">{v.num}</div>
                                <div className="w-8 h-[1px] bg-gold/30 group-hover:w-12 transition-all duration-500" />
                                <p className="text-[10px] uppercase tracking-[0.3em] text-chocolate/60 font-medium">{v.label}</p>
                            </motion.div>
                        ))}
                    </RevealOnScroll>
                </div>
            </section>

            {/* ════════════════════════════════════════
                6. SOCIAL STRIP
            ════════════════════════════════════════ */}
            <RevealOnScroll>
                <section className="py-20 border-t border-b border-gold/10 bg-white/30">
                    <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
                        <div className="section-header !mb-0">
                            <div className="section-header-tag-wrapper">
                                <div className="section-header-line" />
                                <span className="section-header-tag">Social</span>
                            </div>
                            <h2 className="section-header-title !text-2xl md:!text-3xl">
                                Síguenos en <br />
                                <span className="section-header-highlight uppercase">Redes</span>
                            </h2>
                        </div>
                        <div className="flex items-center gap-10">
                            <a href={facebook} target="_blank" rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 text-chocolate/40 hover:text-gold transition-all duration-300 hover:-translate-y-1 group">
                                <FontAwesomeIcon icon={faFacebook} className="text-2xl" />
                                <span className="text-[8px] uppercase tracking-widest">Facebook</span>
                            </a>
                            <a href={instagram} target="_blank" rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 text-chocolate/40 hover:text-gold transition-all duration-300 hover:-translate-y-1 group">
                                <FontAwesomeIcon icon={faInstagram} className="text-2xl" />
                                <span className="text-[8px] uppercase tracking-widest">Instagram</span>
                            </a>
                            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer"
                                className="flex flex-col items-center gap-2 text-chocolate/40 hover:text-[#25D366] transition-all duration-300 hover:-translate-y-1 group">
                                <FontAwesomeIcon icon={faWhatsapp} className="text-2xl" />
                                <span className="text-[8px] uppercase tracking-widest">WhatsApp</span>
                            </a>
                        </div>
                    </div>
                </section>
            </RevealOnScroll>

            <CTABanner />

            <Footer />
        </div >
    );
};

export default Home;