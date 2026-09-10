import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faChevronUp, faBagShopping } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';
import { useConfig } from '@/context/ConfigContext';
import { useQuote } from '@/context/QuoteContext';
import { statsService } from '@/services/statsService';

export const FloatingActions: React.FC = () => {
    const { pathname } = useLocation();
    const [isVisible, setIsVisible] = useState(false);
    const { config } = useConfig();
    const { items, totalItems, totalAmount, setDrawerOpen, isDrawerOpen } = useQuote();

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

    const getContextualWhatsAppMessage = () => {
        if (items.length > 0) {
            let msg = `*¡Hola! Deseo cotizar las siguientes prendas en Arcángel Ceremonias:*\n\n`;
            items.forEach((item, index) => {
                msg += `*${index + 1}. ${item.name}*\n`;
                if (item.code) msg += `   - *Código/Modelo:* ${item.code}\n`;
                if (item.size) msg += `   - *Talla:* ${item.size}\n`;
                if (item.color) msg += `   - *Color:* ${item.color}\n`;
                msg += `   - *Cantidad:* ${item.quantity} pieza(s)\n`;
                if (item.price > 0) {
                    msg += `   - *Subtotal:* $${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN\n`;
                }
                msg += `\n`;
            });
            if (totalAmount > 0) {
                msg += `*TOTAL ESTIMADO: $${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN*\n\n`;
            }
            msg += `_¿Me podrían confirmar disponibilidad, existencias y costos de envío/mayoreo? Gracias._`;
            return encodeURIComponent(msg);
        }

        if (pathname.includes('/producto/')) {
            return encodeURIComponent(`¡Hola! Estoy viendo esta prenda en su catálogo en línea (${window.location.href}) y me gustaría consultar disponibilidad de modelo, tallas y precios.`);
        }
        if (pathname.includes('/catalogo')) {
            return encodeURIComponent("¡Hola! Estoy explorando su catálogo editorial y me gustaría recibir información sobre compras por mayoreo, mínimos y existencias.");
        }
        return encodeURIComponent("¡Hola! Me gustaría recibir más información y catálogo de ceremonias de Arcángel.");
    };

    const handleWhatsAppClick = () => {
        statsService.trackWhatsAppClick(window.location.href);
        const message = getContextualWhatsAppMessage();
        const url = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${message}`;
        window.open(url, 'whatsapp_contact', 'noopener,noreferrer');
    };

    // No mostrar en el panel de administración o cuando el drawer de cotización está abierto
    if (pathname.startsWith('/admin') || isDrawerOpen) {
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
                        className="w-14 h-14 bg-chocolate text-gold border-2 border-gold/40 rounded-full shadow-2xl flex items-center justify-center relative hover:bg-gold hover:text-chocolate transition-all duration-300"
                        aria-label="Ver Cotización"
                        title="Ver Cotización"
                    >
                        <div className="relative flex items-center justify-center">
                            <FontAwesomeIcon icon={faBagShopping} className="text-xl" />
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -top-3 -right-3 bg-gold text-chocolate text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md"
                            >
                                {totalItems}
                            </motion.span>
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
