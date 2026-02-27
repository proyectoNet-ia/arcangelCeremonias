import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { RevealOnScroll } from '@/components/common/RevealOnScroll';
import { useConfig } from '@/context/ConfigContext';
import { statsService } from '@/services/statsService';

const About: React.FC = () => {
    const { config } = useConfig();

    const title = config?.about_title || 'Más de 30 años de tradición';
    const subtitle = config?.about_subtitle || 'Nuestra Historia';
    const quote = config?.about_quote || 'Nuestra misión es ser líderes en la fabricación y manufactura de productos ceremoniales para las nuevas generaciones.';
    const body1 = config?.about_body_1 || 'Con más de tres décadas en el ramo textil, en Arcángel Ceremonias nos dedicamos a satisfacer las necesidades de nuestros clientes con la más alta calidad y un precio justo.';
    const body2 = config?.about_body_2 || 'Creemos firmemente en el comercio justo y en la vocación de servir a nuestros clientes con valores fundamentales: calidad, honradez, amabilidad y especial atención a los detalles.';
    const body3 = config?.about_body_3 || 'Cada pieza que sale de nuestro taller lleva consigo el compromiso de honrar los momentos más importantes de las familias, vistiendo de elegancia y significado cada ceremonia.';
    const imageUrl = config?.about_image_url || '/catalog/portrait-child-getting-ready-their-first-communion.jpg';

    const stats = [
        { value: config?.about_stat_1_value || '30+', label: config?.about_stat_1_label || 'Años de Experiencia', desc: 'Liderando el mercado textil ceremonial.' },
        { value: config?.about_stat_2_value || '500k+', label: config?.about_stat_2_label || 'Prendas Creadas', desc: 'Vistiendo momentos inolvidables.' },
        { value: config?.about_stat_3_value || '150+', label: config?.about_stat_3_label || 'Puntos de Venta', desc: 'Presencia en toda la República Mexicana.' },
        { value: config?.about_stat_4_value || '100%', label: config?.about_stat_4_label || 'Calidad Artesanal', desc: 'Cada detalle es revisado a mano.' },
    ];

    // Parallax Effect for CTA & Main Image
    const ctaRef = useRef(null);
    const mainImgRef = useRef(null);

    // Parallax para el CTA (Fondo)
    const { scrollYProgress: scrollCTA } = useScroll({
        target: ctaRef,
        offset: ["start end", "end start"]
    });
    const ctaY = useTransform(scrollCTA, [0, 1], ["-25%", "25%"]);

    // Parallax para la Imagen Principal (Efecto sutil de subida)
    const { scrollYProgress: scrollMain } = useScroll({
        target: mainImgRef,
        offset: ["start end", "end start"]
    });
    const mainImgY = useTransform(scrollMain, [0, 1], [0, -50]);

    return (
        <div className="min-h-screen bg-cream font-sans text-chocolate selection:bg-gold/20">
            <Header />

            <main className="pt-40 md:pt-52 pb-20 px-6 md:px-12 max-w-[1200px] mx-auto overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <RevealOnScroll direction="right" className="space-y-8">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-semibold">{subtitle}</span>
                        <h1 className="text-5xl md:text-7xl font-serif leading-tight">
                            {title.includes('tradición')
                                ? <>{title.replace('tradición', '')} <span className="italic text-gold/80">tradición</span></>
                                : title
                            }
                        </h1>
                        <div className="h-[1px] w-20 bg-gold/30" />
                        <div className="space-y-6 text-chocolate/80 leading-relaxed font-light">
                            {quote && (
                                <p className="text-lg italic font-serif text-chocolate">
                                    &ldquo;{quote}&rdquo;
                                </p>
                            )}
                            {body1 && <p>{body1}</p>}
                            {body2 && <p>{body2}</p>}
                            {body3 && <p>{body3}</p>}
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll direction="left" className="relative" ref={mainImgRef}>
                        <div className="aspect-[4/5] bg-chocolate/5 overflow-hidden border border-gold/10 shadow-2xl relative">
                            <motion.img
                                style={{ y: mainImgY, scale: 1.1 }}
                                src={imageUrl}
                                alt={title}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/catalog/portrait-child-getting-ready-their-first-communion.jpg';
                                }}
                            />
                        </div>
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-gold/10 -z-10 blur-3xl" />
                    </RevealOnScroll>
                </div>

                {/* Stats */}
                <section className="mt-40 pt-20 border-t border-gold/10">
                    <div className="text-center mb-20 space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-semibold">Nuestra Trayectoria</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-light text-chocolate">Tres décadas de impacto</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {stats.map((stat, idx) => (
                            <RevealOnScroll
                                key={idx}
                                delay={idx * 0.1}
                                className="space-y-4 p-8 bg-white/40 border border-gold/5 hover:border-gold/20 transition-all duration-500"
                            >
                                <div className="text-4xl font-serif text-gold">{stat.value}</div>
                                <div className="h-[1px] w-10 bg-gold/30 mx-auto" />
                                <h4 className="text-[10px] uppercase tracking-widest font-bold text-chocolate">{stat.label}</h4>
                                <p className="text-[11px] text-chocolate/50 font-light leading-relaxed">{stat.desc}</p>
                            </RevealOnScroll>
                        ))}
                    </div>
                </section>
            </main>

            {/* Call to Action - Dynamic from CMS */}
            <RevealOnScroll
                ref={ctaRef}
                className="relative overflow-hidden"
                style={{ backgroundColor: config?.cta_banner_bg_color || '#1B1411' }}
                direction="none"
            >
                {/* Background Image with Parallax & Translucent Overlay */}
                {config?.cta_banner_bg_image_url && (
                    <motion.div
                        className="absolute inset-x-0 -top-[20%] h-[140%] z-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url(${config.cta_banner_bg_image_url})`,
                            y: ctaY
                        }}
                    >
                        {/* Overlay for translucency with dynamic opacity */}
                        <div
                            className="absolute inset-0 z-0"
                            style={{
                                backgroundColor: config?.cta_banner_bg_color || '#1B1411',
                                opacity: config?.cta_banner_bg_opacity ?? 0.85
                            }}
                        />
                    </motion.div>
                )}

                {/* Background decorations consistent with the design */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-5 z-[1]" />

                <div className="relative z-10 py-24 md:py-32 px-8 md:px-20 max-w-[1600px] mx-auto text-center space-y-12">
                    <div className="space-y-6">
                        <span className="text-xs md:text-sm uppercase tracking-[0.4em] text-white font-bold block mb-2">
                            {config?.cta_banner_tag || 'Socios Comerciales'}
                        </span>
                        <h2 className="text-4xl md:text-7xl font-serif text-cream leading-none uppercase">
                            {config?.cta_banner_title || 'Venta al por mayor'}
                            <span className="block italic text-gold lowercase mt-1">
                                {config?.cta_banner_subtitle || '& Boutiques'}
                            </span>
                        </h2>
                    </div>

                    <p className="max-w-3xl mx-auto text-white font-normal text-lg md:text-2xl leading-relaxed">
                        {config?.cta_banner_body || 'Abastecemos a las mejores boutiques de México con diseños exclusivos y calidad artesanal. Solicita nuestro catálogo de precios para negocios.'}
                    </p>

                    <div className="pt-8 flex flex-col sm:flex-row gap-6 justify-center">
                        <button
                            onClick={() => {
                                statsService.trackWhatsAppClick(window.location.href);
                                const phone = (config?.whatsapp || '523521681197').replace(/\D/g, '');
                                const msg = 'Hola, me interesa recibir información sobre las ventas por mayoreo y el catálogo para mi Boutique/Negocio.';
                                window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
                            }}
                            className="px-12 py-5 bg-gold text-chocolate text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold hover:bg-white transition-all duration-500 shadow-xl flex items-center justify-center gap-3"
                        >
                            <FontAwesomeIcon icon={faWhatsapp} className="text-base" />
                            {config?.cta_banner_btn1_label || 'Catálogo Mayoreo'}
                        </button>
                        <a
                            href={`tel:${(config?.phone || '352 52 62502').replace(/\s+/g, '')}`}
                            className="px-12 py-5 border border-white/30 text-white text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-chocolate transition-all duration-500 backdrop-blur-sm flex items-center justify-center gap-3"
                        >
                            <FontAwesomeIcon icon={faPhone} />
                            {config?.cta_banner_btn2_label || 'Línea de Negocios'}
                        </a>
                    </div>
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-gold/10" />
                <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-gold/10" />
            </RevealOnScroll>

            <Footer />
        </div>
    );
};

export default About;
