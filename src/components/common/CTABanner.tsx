import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faDiamond, faPhone } from '@fortawesome/free-solid-svg-icons';
import { useConfig } from '@/context/ConfigContext';
import { statsService } from '@/services/statsService';

interface CTABannerProps {
    customTitle?: string;
    customSubtitle?: string;
    customBody?: string;
}

export const CTABanner: React.FC<CTABannerProps> = ({
    customTitle,
    customSubtitle,
    customBody
}) => {
    const { config } = useConfig();
    const ctaRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: ctaRef,
        offset: ["start end", "end start"]
    });

    const ctaY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

    const whatsapp = config?.whatsapp || '523521681197';
    const phone = config?.phone || '352 52 62502';

    const ctaTag = config?.cta_banner_tag || 'Alianzas Estratégicas';
    const ctaTitle = customTitle || config?.cta_banner_title || 'Venta al por mayor';
    const ctaSubtitle = customSubtitle || config?.cta_banner_subtitle || ' & Socios de Éxito';
    const ctaBody = customBody || config?.cta_banner_body || 'Eleva el prestigio de tu boutique con la distinción de nuestras confecciones exclusivas y calidad de excelencia. Un legado de elegancia diseñado para potenciar tu negocio. Solicita nuestro catálogo de precios para socios comerciales.';
    const ctaBtn1 = config?.cta_banner_btn1_label || 'Catálogo Mayoreo';
    const ctaBtn2 = config?.cta_banner_btn2_label || 'Línea de Negocios';

    const handleWhatsAppClick = () => {
        const waPhone = whatsapp.replace(/\D/g, '');
        statsService.trackWhatsAppClick(window.location.href);
        const msg = 'Hola, me interesa recibir información sobre las piezas de Arcángel Ceremonias y los catálogos disponibles.';
        window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    };

    return (
        <motion.section
            ref={ctaRef}
            className="relative overflow-hidden w-full"
            style={{ backgroundColor: config?.cta_banner_bg_color || '#1B1411' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
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
                    <div
                        className="absolute inset-0 z-0"
                        style={{
                            backgroundColor: config?.cta_banner_bg_color || '#1B1411',
                            opacity: config?.cta_banner_bg_opacity ?? 0.85
                        }}
                    />
                </motion.div>
            )}

            {/* Shimmer */}
            <motion.div
                className="absolute inset-0 pointer-events-none z-[1]"
                style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(197,168,112,0.07) 50%, transparent 60%)' }}
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
            />

            {/* Floating diamonds */}
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute text-gold/5 z-[1]"
                    style={{ top: `${15 + i * 18}%`, left: `${5 + i * 19}%`, fontSize: `${20 + (i % 3) * 14}px` }}
                    animate={{ y: [0, -20, 0], rotate: [0, 25, 0], opacity: [0.03, 0.1, 0.03] }}
                    transition={{ duration: 5 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.8 }}
                >
                    <FontAwesomeIcon icon={faDiamond} />
                </motion.div>
            ))}

            <div className="relative z-10 py-24 md:py-32 px-8 md:px-20 max-w-[1600px] mx-auto text-center space-y-12">
                {/* Standard Section Header Pattern (Centered Variant) */}
                <motion.div
                    className="section-header !text-center !mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                >
                    <div className="section-header-tag-wrapper !justify-center">
                        <div className="section-header-line" />
                        <span className="section-header-tag !text-white">{ctaTag}</span>
                        <div className="section-header-line" />
                    </div>
                    <h2 className="section-header-title !text-cream uppercase !text-4xl md:!text-7xl">
                        {ctaTitle}<br />
                        <span className="section-header-highlight !text-gold">
                            {ctaSubtitle}
                        </span>
                    </h2>
                    <p className="max-w-3xl mx-auto text-white/90 font-light text-base md:text-xl leading-relaxed pt-6">
                        {ctaBody}
                    </p>
                </motion.div>

                {/* Buttons centered */}
                <motion.div
                    className="pt-8 flex flex-col sm:flex-row gap-6 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.35 }}
                >
                    <motion.button
                        onClick={handleWhatsAppClick}
                        whileHover={{ scale: 1.04, boxShadow: '0 20px 50px rgba(37,211,102,0.2)' }}
                        whileTap={{ scale: 0.97 }}
                        className="px-12 py-5 bg-gold text-chocolate text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold hover:bg-white transition-all duration-500 shadow-xl flex items-center justify-center gap-3 group"
                    >
                        <FontAwesomeIcon icon={faWhatsapp} className="text-base group-hover:scale-110 transition-transform duration-300" />
                        {ctaBtn1}
                    </motion.button>
                    <motion.button
                        onClick={() => window.open(`tel:${phone.replace(/\s+/g, '')}`)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-12 py-5 border border-white/30 text-white text-[10px] md:text-xs uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-chocolate transition-all duration-500 backdrop-blur-sm flex items-center justify-center gap-3"
                    >
                        <FontAwesomeIcon icon={faPhone} />
                        {ctaBtn2}
                    </motion.button>
                </motion.div>
            </div>

            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-gold/10" />
            <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-gold/10" />
        </motion.section>
    );
};
