import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { ShoppingBag } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useConfig } from '@/context/ConfigContext';
import { useQuote } from '@/context/QuoteContext';
import { statsService } from '@/services/statsService';

export const FloatingActions: React.FC = () => {
    const { pathname } = useLocation();
    const [isVisible, setIsVisible] = useState(false);
    const { config } = useConfig();
    const { totalItems, setDrawerOpen } = useQuote();

    // Show button when page is scrolled down
    const toggleVisibility = () => {
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const whatsappNumber = config?.whatsapp || "523521681197";
    const whatsappMessage = encodeURIComponent("Hola, me gustaría recibir más información sobre sus servicios.");

    const handleWhatsAppClick = () => {
        statsService.trackWhatsAppClick(window.location.href);
        const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${whatsappMessage}`;
        window.open(url, 'whatsapp_contact', 'noopener,noreferrer');
    };

    // No mostrar en el panel de administración
    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-center gap-4">
            {/* Scroll to Top Button */}
            <AnimatePresence>
                {isVisible && (
                    <motion.button
                        key="scroll-top"
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={scrollToTop}
                        className="w-14 h-14 bg-white border border-gold/20 text-chocolate rounded-full shadow-lg flex items-center justify-center hover:bg-gold hover:text-white transition-colors duration-300 group"
                        title="Ir arriba"
                    >
                        <FontAwesomeIcon icon={faChevronUp} className="text-base group-hover:-translate-y-1 transition-transform" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Quote Button */}
            <AnimatePresence>
                {totalItems > 0 && (
                    <motion.button
                        key="quote-button"
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 20 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setDrawerOpen(true)}
                        className="w-14 h-14 bg-[#C5A059] text-white rounded-full shadow-2xl flex items-center justify-center relative"
                        aria-label="Ver Cotización"
                        title="Ver Cotización"
                    >
                        <div className="relative">
                            <ShoppingBag size={24} />
                            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                {totalItems}
                            </span>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* WhatsApp Button */}
            <motion.button
                key="whatsapp-button"
                onClick={handleWhatsAppClick}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden group"
                title="Escríbenos por WhatsApp"
            >
                {/* Ripple Effect Animation */}
                <span className="absolute inset-0 bg-white/20 animate-ping opacity-0 group-hover:opacity-100 rounded-full"></span>
                <FontAwesomeIcon icon={faWhatsapp} className="text-2xl z-10" />
            </motion.button>
        </div>
    );
};
