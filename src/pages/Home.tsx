import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
                setProducts(data.slice(0, 8));
            } catch (e) {
                console.error(e);
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
        <div className="min-h-screen bg-cream font-sans text-chocolate selection:bg-gold/20">
            <Header />

            {/* ════════════════════════════════════════
                1. HERO SLIDER
            ════════════════════════════════════════ */}
            <section className="relative h-[140vh] w-full overflow-hidden">

                {/* Background slides */}
                <AnimatePresence mode="sync">
                    <motion.div
                        key={`bg-${activeSlide}`}
                        className="absolute inset-0 z-0"
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
                        <div className="absolute inset-0 bg-black/40 md:bg-black/50" />
                        <div className="absolute inset-0 bg-chocolate/30 md:bg-chocolate/35 mix-blend-multiply" />
                        <div className="absolute inset-0 bg-gradient-to-t from-chocolate/95 via-chocolate/20 to-chocolate/40 md:from-chocolate/90 md:via-transparent md:to-chocolate/30" />
                        <div className="absolute inset-0 bg-gradient-to-r from-chocolate/80 via-transparent to-transparent hidden md:block" />
                    </motion.div>
                </AnimatePresence>


                {/* Noise texture */}
                <div className="absolute inset-0 z-[2] opacity-[0.04] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/marble-similar.png')]" />

                {/* Slide content */}
                <div className="relative z-10 h-full flex flex-col">
                    {/* Spacer for header */}
                    <div className="h-40 md:h-48 shrink-0" />

                    {/* Text content */}
                    <div className={`flex-grow flex flex-col justify-center px-6 md:px-16 lg:px-24 xl:px-32 ${alignClass}`}>
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
                                    <div className="w-8 h-[1px] bg-gold/60" />
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
                                    <span className="block text-[2.75rem] xs:text-5xl md:text-7xl lg:text-8xl xl:text-9xl uppercase">
                                        {slide.title[0]}
                                    </span>
                                    <span className="block text-[2.75rem] xs:text-5xl md:text-7xl lg:text-8xl xl:text-9xl uppercase text-gold/80">
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
                                    className="text-cream/70 text-sm md:text-base font-light leading-relaxed max-w-md"
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
                    <div className="relative z-10 px-6 md:px-16 pb-8 md:pb-10 flex items-center justify-between text-cream/60">
                        {/* Slide indicators */}
                        <div className="flex items-center gap-3">
                            {slides.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveSlide(i)}
                                    className={`transition-all duration-500 ${i === activeSlide ? 'w-8 h-[2px] bg-gold' : 'w-3 h-[1px] bg-cream/30 hover:bg-cream/60'}`}
                                />
                            ))}
                        </div>

                        {/* Prev / Next */}
                        <div className="flex items-center gap-4">
                            <button onClick={prev} className="w-10 h-10 border border-cream/20 flex items-center justify-center hover:border-gold hover:text-gold transition-all duration-300">
                                <FontAwesomeIcon icon={faChevronLeft} className="text-xs" />
                            </button>
                            <button onClick={next} className="w-10 h-10 border border-cream/20 flex items-center justify-center hover:border-gold hover:text-gold transition-all duration-300">
                                <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ════════════════════════════════════════
                2. TRUST BADGES STRIP
            ════════════════════════════════════════ */}
            <section className="bg-chocolate py-6 overflow-hidden">
                <div className="flex gap-16 animate-[marquee_25s_linear_infinite] w-max">
                    {[...badges, ...badges].map((b, i) => (
                        <div key={i} className="flex items-center gap-3 shrink-0 text-cream/50">
                            <FontAwesomeIcon icon={b.icon} className="text-gold/60 text-sm" />
                            <span className="text-[9px] uppercase tracking-[0.4em] font-medium whitespace-nowrap">{b.label}</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-gold/20" />
                        </div>
                    ))}
                </div>
            </section>

            {/* ════════════════════════════════════════
                3. FEATURED PRODUCTS
            ════════════════════════════════════════ */}
            <section className="py-28 md:py-40 px-6 md:px-12 max-w-[1600px] mx-auto">
                <RevealOnScroll className="space-y-16">
                    {/* Section header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gold/10 pb-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-[1px] bg-gold/40" />
                                <span className="text-[9px] uppercase tracking-[0.5em] text-gold font-bold">Colección</span>
                            </div>
                            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-chocolate uppercase leading-tight">
                                Artículos<br />
                                <span className="text-gold/70">Destacados</span>
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

                    {/* Product grid */}
                    {loadingProducts ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="aspect-[3/4] bg-chocolate/5 animate-pulse rounded-sm" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-10">
                            {products.map((product, idx) => (
                                <ProductCard key={product.id} product={product} index={idx} />
                            ))}
                        </div>
                    )}

                    {/* Bottom CTA */}
                    <div className="flex justify-center pt-8">
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
                4. CTA WHATSAPP BANNER
            ════════════════════════════════════════ */}
            <motion.section
                className="relative overflow-hidden bg-chocolate"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8 }}
            >
                {/* Shimmer */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(197,168,112,0.07) 50%, transparent 60%)' }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
                />
                {/* Floating diamonds */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-gold/5"
                        style={{ top: `${15 + i * 18}%`, left: `${5 + i * 19}%`, fontSize: `${20 + (i % 3) * 14}px` }}
                        animate={{ y: [0, -20, 0], rotate: [0, 25, 0], opacity: [0.03, 0.1, 0.03] }}
                        transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
                    >
                        <FontAwesomeIcon icon={faDiamond} />
                    </motion.div>
                ))}

                <div className="relative z-10 py-24 md:py-32 px-8 md:px-20 flex flex-col md:flex-row items-center justify-between gap-12 max-w-[1600px] mx-auto">
                    {/* Text */}
                    <motion.div
                        className="space-y-6 text-center md:text-left"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <span className="text-[9px] uppercase tracking-[0.6em] text-gold/50 font-bold block">Socios Comerciales</span>
                        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-cream leading-tight uppercase">
                            Venta al por mayor<br className="hidden md:block" />
                            <span className="text-gold/70 md:ml-2">& Boutiques</span>
                        </h2>
                        <p className="text-cream/50 text-sm font-light leading-relaxed max-w-md">
                            Abastecemos a las mejores boutiques de México con diseños exclusivos y calidad artesanal. Solicita nuestro catálogo de precios para negocios.
                        </p>
                    </motion.div>

                    {/* Buttons */}
                    <motion.div
                        className="flex flex-col sm:flex-row gap-4"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: 0.35 }}
                    >
                        <motion.a
                            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Hola, me interesa recibir información sobre las ventas por mayoreo y el catálogo para mi Boutique/Negocio.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.04, boxShadow: '0 20px 50px rgba(37,211,102,0.2)' }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-4 bg-[#25D366] text-white px-10 py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:bg-[#1ebe59] transition-all duration-400 group"
                        >
                            <FontAwesomeIcon icon={faWhatsapp} className="text-lg group-hover:scale-110 transition-transform" />
                            Catálogo Mayoreo
                        </motion.a>
                        <motion.a
                            href={`tel:${phone.replace(/\s+/g, '')}`}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            className="flex items-center gap-4 border border-cream/20 text-cream px-10 py-5 text-[10px] uppercase tracking-[0.4em] font-bold hover:border-gold hover:text-gold transition-all duration-400"
                        >
                            Línea de Negocios
                        </motion.a>
                    </motion.div>
                </div>
            </motion.section>

            {/* ════════════════════════════════════════
                5. EMPRESA INFO + VALORES
            ════════════════════════════════════════ */}
            <section className="py-28 md:py-40 px-6 md:px-12 max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 xl:gap-40 items-center">

                    {/* Left: Story */}
                    <RevealOnScroll className="space-y-10">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-[1px] bg-gold/40" />
                                <span className="text-[9px] uppercase tracking-[0.5em] text-gold font-bold">Nuestra Historia</span>
                            </div>
                            <h2 className="font-serif text-4xl md:text-5xl text-chocolate uppercase leading-tight">
                                Más de 30 Años<br />
                                <span className="text-gold/70">de Tradición</span>
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
                <section className="py-16 border-t border-b border-gold/10 bg-white/30">
                    <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-2">
                            <span className="text-[9px] uppercase tracking-[0.5em] text-gold font-bold block">Síguenos</span>
                            <p className="text-base font-serif text-chocolate">Ceremonias que se visten de elegancia</p>
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

            <Footer />
        </div>
    );
};

export default Home;