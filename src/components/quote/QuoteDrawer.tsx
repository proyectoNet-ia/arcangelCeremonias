import React, { useState, useEffect } from 'react';
import { useQuote } from '../../context/QuoteContext';
import { useConfig } from '../../context/ConfigContext';
import { quoteService } from '../../services/quoteService';
import { X, Plus, Minus, Trash2, FileText, Loader2, CheckCircle } from 'lucide-react';
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
            
            // 1. Generar PDF Blob
            const pdfBlob = await quoteService.generateQuotePDF(userData, items, totalAmount, config);
            
            // 2. Subir a Supabase
            const submitted = await quoteService.submitQuote(userData, items, totalAmount, pdfBlob);
            
            if (!submitted) {
                toast.error("Ocurrió un error al guardar la cotización, pero podrás descargar el PDF.");
            }

            // 3. Descargar localmente
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Cotizacion_${name.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

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

            toast.success("¡Cotización generada con éxito!");
            
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
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-[#3E2723] uppercase tracking-wider flex items-center gap-2">
                                <FileText className="text-[#C5A059]" />
                                Tu Cotización
                            </h2>
                            <button
                                onClick={() => setDrawerOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {items.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <FileText className="text-gray-300" size={40} />
                                </div>
                                <p className="text-gray-500 text-sm uppercase tracking-wider font-bold">Aún no hay productos</p>
                                <p className="text-gray-400 text-xs mt-2">Agrega productos al carrito de cotización para continuar.</p>
                                <button 
                                    onClick={() => setDrawerOpen(false)}
                                    className="mt-6 text-[#C5A059] text-xs font-bold uppercase tracking-widest hover:underline"
                                >
                                    Seguir explorando
                                </button>
                            </div>
                        ) : isSuccess ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="text-green-500"
                                >
                                    <CheckCircle size={64} />
                                </motion.div>
                                <h3 className="text-xl font-bold text-[#3E2723]">¡Listo!</h3>
                                <p className="text-gray-500 text-sm">Tu cotización ha sido generada y descargada exitosamente.</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col overflow-hidden">
                                {/* Lista de productos */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                    {items.map((item) => (
                                        <div key={item.cartItemId} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="w-16 h-20 object-cover rounded bg-white shadow-sm" />
                                            ) : (
                                                <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                                                    <FileText className="text-gray-400" size={24} />
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h4 className="text-sm font-bold text-[#3E2723] line-clamp-2">{item.name}</h4>
                                                {item.code && (
                                                    <p className="text-[10px] text-gold uppercase tracking-widest font-bold mt-0.5">
                                                        Modelo: {item.code}
                                                    </p>
                                                )}
                                                {(item.size || item.color) && (
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {item.size && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-gold/10 text-gold text-[9px] font-bold uppercase tracking-wider">
                                                                Talla: {item.size}
                                                            </span>
                                                        )}
                                                        {item.color && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#3D2B1F]/5 text-[#3D2B1F]/80 text-[9px] font-bold uppercase tracking-wider">
                                                                Color: {item.color}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <p className="text-xs text-[#C5A059] font-bold mt-1.5">
                                                    ${item.price.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-full px-2 py-1">
                                                        <button 
                                                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                                                            className="text-gray-500 hover:text-[#C5A059]"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                            className="text-gray-500 hover:text-[#C5A059]"
                                                            disabled={item.quantity >= 11}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeItem(item.cartItemId)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Formulario y Total */}
                                <div className="p-6 bg-gray-50 border-t border-gray-100">
                                    <div className="flex justify-between items-center mb-6">
                                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total</span>
                                        <span className="text-2xl font-bold text-[#3E2723]">
                                            ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </span>
                                    </div>

                                    <form onSubmit={handleGenerate} className="space-y-4">
                                        <div className="space-y-3">
                                            <input required type="text" placeholder="Nombre completo *" value={name} onChange={e => setName(e.target.value.toUpperCase())} className="w-full text-sm p-3 rounded bg-white border border-gray-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none uppercase" />
                                            <input type="text" placeholder="Empresa (Opcional)" value={company} onChange={e => setCompany(e.target.value.toUpperCase())} className="w-full text-sm p-3 rounded bg-white border border-gray-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none uppercase" />
                                            <div className="grid grid-cols-2 gap-3">
                                                <input required type="tel" placeholder="Teléfono *" value={phone} onChange={handlePhoneChange} maxLength={14} className="w-full text-sm p-3 rounded bg-white border border-gray-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none" />
                                                <input required type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} className="w-full text-sm p-3 rounded bg-white border border-gray-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059] outline-none" />
                                            </div>
                                        </div>

                                        {/* Security Verification (Captcha) */}
                                        <div className="space-y-2 pt-1 pb-2">
                                            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 block">
                                                Verificación de seguridad *
                                            </label>
                                            <div className="flex items-center gap-3">
                                                <div className="bg-gray-100 border border-gray-200 text-[#3E2723] px-4 py-3 rounded text-xs font-bold select-none whitespace-nowrap">
                                                    ¿Cuánto es {captchaNum1} + {captchaNum2}?
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
                                                    className={`w-28 text-sm p-3 rounded bg-white border ${captchaError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#C5A059] focus:ring-[#C5A059]'} outline-none text-center`}
                                                />
                                            </div>
                                            {captchaError && (
                                                <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1">
                                                    Respuesta incorrecta. Inténtalo de nuevo.
                                                </p>
                                            )}
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={isGenerating}
                                            className="w-full py-4 bg-[#3E2723] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#C5A059] transition-colors flex justify-center items-center gap-2 rounded"
                                        >
                                            {isGenerating ? <><Loader2 size={16} className="animate-spin" /> Generando...</> : "Generar PDF y Enviar"}
                                        </button>
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
