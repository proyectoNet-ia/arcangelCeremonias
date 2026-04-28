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
import { CTABanner } from '@/components/common/CTABanner';

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
        { value: config?.about_stat_4_value || '100%', label: config?.about_stat_4_label || 'Calidad Auténtica', desc: 'Cada detalle es revisado a mano.' },
    ];

    const mainImgRef = useRef(null);

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
                    <RevealOnScroll direction="right" className="section-header !mb-0">
                        <div className="section-header-tag-wrapper">
                            <div className="section-header-line" />
                            <span className="section-header-tag">{subtitle}</span>
                        </div>
                        <h1 className="section-header-title">
                            Más de 30 Años<br />
                            <span className="section-header-highlight uppercase">de Tradición</span>
                        </h1>
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
                    <div className="section-header !text-center !mb-20">
                        <div className="section-header-tag-wrapper !justify-center">
                            <div className="section-header-line" />
                            <span className="section-header-tag">Trayectoria</span>
                            <div className="section-header-line" />
                        </div>
                        <h2 className="section-header-title">
                            Tres décadas de <br />
                            <span className="section-header-highlight uppercase">impacto</span>
                        </h2>
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

            <CTABanner />

            <Footer />
        </div>
    );
};

export default About;
