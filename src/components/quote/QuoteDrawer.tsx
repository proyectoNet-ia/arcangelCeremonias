import React, { useState, useEffect } from 'react';
import { useQuote } from '../../context/QuoteContext';
import { useConfig } from '../../context/ConfigContext';
import { quoteService } from '../../services/quoteService';
import { statsService } from '../../services/statsService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes,
    faPlus,
    faMinus,
    faTrash,
    faFileLines,
    faSpinner,
    faCheckCircle,
    faFilePdf
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const QuoteDrawer: React.FC = () => {
    const { items, isDrawerOpen, setDrawerOpen, totalAmount, updateQuantity, removeItem, clearQuote } = useQuote();
    const { config } = useConfig();
    
    const [name, setName] = useState('');
    const [company, setCompany] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Captcha States
    const [captchaNum1, setCaptchaNum1] = useState(0);
    const [captchaNum2, setCaptchaNum2] = useState(0);
    const [captchaAnswer, setCaptchaAnswer] = useState('');
    const [captchaError, setCaptchaError] = useState(false);

    const generateCaptcha = () => {
        setCaptchaNum1(Math.floor(Math.random() * 9) + 1);
        setCaptchaNum2(Math.floor(Math.random() * 9) + 1);
        setCaptchaAnswer('');
        setCaptchaError(false);
    };

    useEffect(() => {
        if (isDrawerOpen) {
            generateCaptcha();
        }
    }, [isDrawerOpen]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const cleaned = input.replace(/\D/g, '').slice(0, 10);
        let formatted = cleaned;
        if (cleaned.length > 6) {
            formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length > 3) {
            formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        }
        setPhone(formatted);
    };

    const handleSendWhatsApp = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (items.length === 0) return;

        const waNumber = (config?.whatsapp || '523521681197').replace(/\D/g, '');
        
        let text = `*¡Hola! Deseo cotizar el siguiente pedido en Arcángel Ceremonias:*\n\n`;
        if (name.trim()) text += `*Cliente:* ${name.trim()}\n`;
        if (company.trim()) text += `*Empresa/Boutique:* ${company.trim()}\n`;
        if (phone.trim()) text += `*Teléfono:* ${phone.trim()}\n\n`;
        
        text += `*Detalle de Prendas (${items.length} piezas):*\n`;
        items.forEach((item, index) => {
            text += `*${index + 1}. ${item.name}*\n`;
            if (item.code) text += `   - *Código/Modelo:* ${item.code}\n`;
            if (item.size) text += `   - *Talla:* ${item.size}\n`;
            if (item.color) text += `   - *Color:* ${item.color}\n`;
            text += `   - *Cantidad:* ${item.quantity} pieza(s) | *Subtotal:* $${(item.price * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN\n\n`;
        });

        text += `*TOTAL ESTIMADO: $${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN*\n\n`;
        text += `_Favor de confirmarme existencias, tiempos de entrega y condiciones de mayoreo._`;

        statsService.trackWhatsAppClick(window.location.href);
        const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        toast.success('Abriendo WhatsApp con tu pedido...');
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.length === 0) return;

        // Captcha Validation
        if (parseInt(captchaAnswer) !== (captchaNum1 + captchaNum2)) {
            setCaptchaError(true);
            toast.error("Verificación de seguridad incorrecta. Inténtalo de nuevo.");
            generateCaptcha();
            return;
        }

        try {
            setIsGenerating(true);

            const userData = { name, company, phone, email };
            
            // 1. Obtener consecutivo de orden (QWEB001, etc.)
            const consecutive = await quoteService.getNextConsecutiveNumber();

            // 2. Generar PDF Blob
            const pdfBlob = await quoteService.generateQuotePDF(userData, items, totalAmount, config);

            // 3. Generar Archivo TXT para Ensamblex ERP
            const { filename: txtFileName, blob: txtBlob } = quoteService.generateEnsamblexTXT(items, consecutive);
            
            // 4. Subir a Supabase
            const { success: submitted } = await quoteService.submitQuote(
                userData,
                items,
                totalAmount,
                pdfBlob,
                txtBlob,
                consecutive
            );
            
            if (!submitted) {
                toast.error("Ocurrió un error al guardar la cotización, pero podrás descargar los archivos.");
            }

            // 5. Descargar PDF localmente
            const pdfUrl = window.URL.createObjectURL(pdfBlob);
            const aPdf = document.createElement('a');
            aPdf.href = pdfUrl;
            aPdf.download = `Cotizacion_${name.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(aPdf);
            aPdf.click();
            window.URL.revokeObjectURL(pdfUrl);
            document.body.removeChild(aPdf);

            // 6. Descargar archivo TXT para Ensamblex localmente
            setTimeout(() => {
                const txtUrl = window.URL.createObjectURL(txtBlob);
                const aTxt = document.createElement('a');
                aTxt.href = txtUrl;
                aTxt.download = txtFileName;
                document.body.appendChild(aTxt);
                aTxt.click();
                window.URL.revokeObjectURL(txtUrl);
                document.body.removeChild(aTxt);
            }, 300);

            setIsSuccess(true);
            setTimeout(() => {
                clearQuote();
                setDrawerOpen(false);
                setIsSuccess(false);
                setName('');
                setCompany('');
                setPhone('');
                setEmail('');
                setCaptchaAnswer('');
            }, 3000);

            toast.success(`¡Cotización generada! (${txtFileName} y PDF descargados)`);
            
        } catch (error) {
            console.error("Error generating quote:", error);
            toast.error("Error al generar la cotización.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AnimatePresence>
            {isDrawerOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setDrawerOpen(false)}
                        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gold/15 bg-white">
                            <h2 className="text-base font-serif font-bold text-chocolate uppercase tracking-widest flex items-center gap-2.5">
                                <FontAwesomeIcon icon={faFileLines} className="text-gold" />
                                Tu Cotización
                            </h2>
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-gold/10 flex items-center justify-center transition-colors text-chocolate/50 hover:text-chocolate"
                            >
                                <FontAwesomeIcon icon={faTimes} className="text-sm" />
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-cream/30">
                                <div className="w-20 h-20 bg-white border border-gold/20 rounded-full flex items-center justify-center mb-4 shadow-sm">
                                    <FontAwesomeIcon icon={faFileLines} className="text-gold/40 text-3xl" />
                                </div>
                                <p className="text-chocolate font-serif text-lg font-bold">Aún no hay prendas</p>
                                <p className="text-chocolate/50 text-xs mt-2 max-w-xs">Agrega prendas desde el catálogo para generar tu cotización o pedir por WhatsApp.</p>
                                <button 
                                    onClick={() => setDrawerOpen(false)}
                                    className="mt-6 px-6 py-3 bg-chocolate text-cream text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold transition-colors shadow-md rounded-sm"
                                >
                                    Explorar Catálogo
                                </button>
                            </div>
                        ) : isSuccess ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-cream/30">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-emerald-500 text-5xl"
                                >
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                </motion.div>
                                <h3 className="text-2xl font-serif text-chocolate font-bold">¡Cotización Generada!</h3>
                                <p className="text-chocolate/60 text-xs">Tu documento se descargó correctamente y ha sido registrado.</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col overflow-hidden bg-cream/20">
                                {/* Lista de productos */}
                                <div className="flex-1 overflow-y-auto p-5 space-y-3.5 no-scrollbar">
                                    {items.map((item) => (
                                        <div key={item.cartItemId} className="flex gap-4 p-4 bg-white border border-gold/15 rounded-sm shadow-sm">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    loading="lazy"
                                                    decoding="async"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'https://placehold.co/200x300/f8f5f2/8b643c?text=Prenda';
                                                    }}
                                                    className="w-16 h-20 object-cover rounded-sm bg-chocolate/5 shadow-sm border border-gold/10 flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-16 h-20 bg-chocolate/5 rounded-sm flex items-center justify-center border border-gold/10 flex-shrink-0">
                                                    <FontAwesomeIcon icon={faFileLines} className="text-gold/40 text-xl" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-serif font-bold text-chocolate truncate">{item.name}</h4>
                                                {item.code && (
                                                    <p className="text-[9px] text-gold uppercase tracking-widest font-bold mt-0.5 truncate">
                                                        Modelo: {item.code}
                                                    </p>
                                                )}
                                                {(item.size || item.color) && (
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {item.size && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-gold/10 text-gold text-[8px] font-bold uppercase tracking-wider">
                                                                Talla: {item.size}
                                                            </span>
                                                        )}
                                                        {item.color && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-chocolate/5 text-chocolate/80 text-[8px] font-bold uppercase tracking-wider">
                                                                Color: {item.color}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <p className="text-xs text-gold font-bold mt-1">
                                                    ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                                <div className="flex items-center justify-between mt-2.5">
                                                    <div className="flex items-center gap-2 bg-cream/50 border border-gold/20 rounded-sm px-2 py-0.5">
                                                        <button 
                                                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                                            className="text-chocolate/60 hover:text-gold transition-colors p-1"
                                                            title="Disminuir"
                                                        >
                                                            <FontAwesomeIcon icon={faMinus} className="text-[9px]" />
                                                        </button>
                                                        <span className="text-[11px] font-bold w-4 text-center text-chocolate">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                            className="text-chocolate/60 hover:text-gold transition-colors p-1"
                                                            disabled={item.quantity >= 99}
                                                            title="Aumentar"
                                                        >
                                                            <FontAwesomeIcon icon={faPlus} className="text-[9px]" />
                                                        </button>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeItem(item.cartItemId)}
                                                        className="text-chocolate/30 hover:text-red-500 transition-colors p-1.5"
                                                        title="Eliminar del cotizador"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Formulario y Dual CTA */}
                                <div className="p-5 bg-white border-t border-gold/15 shadow-lg space-y-4">
                                    <div className="flex justify-between items-baseline border-b border-gold/10 pb-3">
                                        <span className="text-[10px] font-bold text-chocolate/50 uppercase tracking-widest">Total Estimado</span>
                                        <span className="text-xl font-serif font-bold text-chocolate">
                                            ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px] font-sans font-normal text-chocolate/50">MXN</span>
                                        </span>
                                    </div>

                                    {/* Primary Fast WhatsApp CTA */}
                                    <button
                                        type="button"
                                        onClick={handleSendWhatsApp}
                                        className="w-full py-3.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-2.5 shadow-md hover:shadow-lg rounded-sm"
                                    >
                                        <FontAwesomeIcon icon={faWhatsapp} className="text-base" />
                                        Enviar Pedido por WhatsApp
                                    </button>

                                    {/* Collapsible / Optional PDF form */}
                                    <form onSubmit={handleGenerate} className="space-y-3 pt-1">
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Nombre o Boutique *"
                                                value={name}
                                                onChange={e => setName(e.target.value.toUpperCase())}
                                                className="w-full text-xs p-2.5 rounded-sm bg-cream/20 border border-gold/20 focus:border-gold outline-none uppercase placeholder:text-chocolate/30"
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                <input
                                                    type="tel"
                                                    placeholder="Teléfono"
                                                    value={phone}
                                                    onChange={handlePhoneChange}
                                                    maxLength={14}
                                                    className="w-full text-xs p-2.5 rounded-sm bg-cream/20 border border-gold/20 focus:border-gold outline-none placeholder:text-chocolate/30"
                                                />
                                                <input
                                                    type="email"
                                                    placeholder="Email"
                                                    value={email}
                                                    onChange={e => setEmail(e.target.value)}
                                                    className="w-full text-xs p-2.5 rounded-sm bg-cream/20 border border-gold/20 focus:border-gold outline-none placeholder:text-chocolate/30"
                                                />
                                            </div>
                                        </div>

                                        {/* Security Verification (Captcha) for PDF */}
                                        <div className="flex items-center gap-2.5 pt-1">
                                            <div className="bg-cream/40 border border-gold/20 text-chocolate px-3 py-2 rounded-sm text-[10px] font-bold select-none whitespace-nowrap">
                                                ¿{captchaNum1} + {captchaNum2}?
                                            </div>
                                            <input
                                                required
                                                type="text"
                                                placeholder="Respuesta *"
                                                value={captchaAnswer}
                                                onChange={e => {
                                                    setCaptchaAnswer(e.target.value.replace(/\D/g, ''));
                                                    setCaptchaError(false);
                                                }}
                                                className={`flex-grow text-xs p-2 rounded-sm bg-cream/20 border ${captchaError ? 'border-red-500' : 'border-gold/20 focus:border-gold'} outline-none text-center`}
                                            />
                                            <button 
                                                type="submit" 
                                                disabled={isGenerating}
                                                className="px-4 py-2 bg-chocolate text-cream hover:bg-gold text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
                                                title="Descargar PDF formal"
                                            >
                                                {isGenerating ? <FontAwesomeIcon icon={faSpinner} className="animate-spin text-xs" /> : <FontAwesomeIcon icon={faFilePdf} className="text-gold" />}
                                                <span>PDF</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
