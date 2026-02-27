import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt, faDiamond } from '@fortawesome/free-solid-svg-icons';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import toast from 'react-hot-toast';
import { RevealOnScroll } from '@/components/common/RevealOnScroll';
import { useConfig } from '@/context/ConfigContext';
import { contactService } from '@/services/contactService';

const Contact: React.FC = () => {
    const { config } = useConfig();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [captcha, setCaptcha] = useState({ a: 0, b: 0, result: 0 });
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutTime, setLockoutTime] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        subject: '',
        message: '',
        captcha: '',
        honeypot: '' // Campo invisible para atrapar bots
    });

    // Check for lockout on mount and every second
    React.useEffect(() => {
        const timer = setInterval(() => {
            if (lockoutTime && Date.now() > lockoutTime) {
                setLockoutTime(null);
                setFailedAttempts(0);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [lockoutTime]);

    // Generate dynamic captcha on mount
    React.useEffect(() => {
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        setCaptcha({ a, b, result: a + b });
    }, []);

    const sanitizeInput = (text: string) => {
        // Sanatización básica: eliminar etiquetas HTML para evitar XSS
        return text.replace(/<[^>]*>?/gm, '').trim();
    };

    const whatsapp = config?.whatsapp || '523521681197';
    const phone = config?.phone || '352 52 62502';
    const email = config?.email || 'ventas@arcangelceremonias.com';
    const facebook = config?.facebook_url || 'https://facebook.com/arcangel.ceremonias';
    const instagram = config?.instagram_url || 'https://instagram.com/ceremonias.arcangel';
    const address = config?.address || 'Igualdad #200, Ejido de Potrerillos, La Piedad, Michoacán, MX.';
    const mapsUrl = config?.google_maps_url;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Honeypot check (Si un bot llena este campo invisible, lo ignoramos)
        if (formData.honeypot) {
            console.log("Bot detected via honeypot");
            setSubmitted(true); // Engañamos al bot
            return;
        }

        // 2. Lockout check
        if (lockoutTime && Date.now() < lockoutTime) {
            const minutesLeft = Math.ceil((lockoutTime - Date.now()) / 60000);
            toast.error(`Demasiados intentos. Intenta de nuevo en ${minutesLeft} minutos.`);
            return;
        }

        // 3. Dynamic Captcha Check
        if (parseInt(formData.captcha) !== captcha.result) {
            const newAttempts = failedAttempts + 1;
            setFailedAttempts(newAttempts);

            if (newAttempts >= 3) {
                const fiveMinutes = Date.now() + 2 * 60 * 1000; // 2 minutos de bloqueo
                setLockoutTime(fiveMinutes);
                toast.error('Has superado los intentos permitidos. Bloqueo temporal activado.');
            } else {
                toast.error(`Respuesta incorrecta. Te quedan ${3 - newAttempts} intentos.`);
            }
            return;
        }

        // Phone Validation (Basic check for digits)
        const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length < 10) {
            toast.error('Por favor, ingresa un número de teléfono válido (al menos 10 dígitos).');
            return;
        }

        // Auto-prefix with 52 (Mexico) if it's exactly 10 digits
        const finalPhone = cleanPhone.length === 10 ? `52${cleanPhone}` : cleanPhone;

        try {
            setIsSubmitting(true);

            // Sanitización de datos antes de enviar para evitar inyecciones/XSS
            const cleanData = {
                name: sanitizeInput(formData.name),
                phone: finalPhone,
                subject: sanitizeInput(formData.subject),
                message: sanitizeInput(formData.message)
            };

            await contactService.sendMessage(cleanData);

            setSubmitted(true);
            toast.success('Mensaje recibido. Nos pondremos en contacto pronto.');
        } catch (error) {
            console.error(error);
            toast.error('Hubo un error al enviar el mensaje. Por favor intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;

        if (id === 'phone') {
            // Eliminar todo lo que no sea número
            const numbers = value.replace(/\D/g, '');
            // Limitar a los primeros 10 dígitos
            const limited = numbers.slice(0, 10);

            // Aplicar formato (000) 000-0000
            let formatted = limited;
            if (limited.length > 0) {
                formatted = `(${limited.slice(0, 3)}`;
                if (limited.length > 3) {
                    formatted += `) ${limited.slice(3, 6)}`;
                    if (limited.length > 6) {
                        formatted += `-${limited.slice(6, 10)}`;
                    }
                }
            } else {
                formatted = '';
            }

            setFormData(prev => ({ ...prev, phone: formatted }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            subject: '',
            message: '',
            captcha: ''
        });
        setSubmitted(false);
        // Regenerar captcha
        const a = Math.floor(Math.random() * 9) + 1;
        const b = Math.floor(Math.random() * 9) + 1;
        setCaptcha({ a, b, result: a + b });
    };

    return (
        <div className="min-h-screen bg-cream font-sans text-chocolate selection:bg-gold/20 overflow-hidden">
            <Header />

            {/* Background elements for consistency */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 -right-20 w-80 h-80 bg-gold/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-chocolate/5 rounded-full blur-[100px]" />
            </div>

            <main className="relative z-10 pt-40 md:pt-52 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto">
                {/* HERO SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-24">
                    <RevealOnScroll direction="right" className="space-y-4 max-w-2xl">
                        <span className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold block">
                            Estamos cerca de ti
                        </span>
                        <h1 className="text-5xl md:text-8xl font-serif leading-tight">
                            Contacto <br />
                            <span className="italic text-gold/80 font-light">Directo</span>
                        </h1>
                    </RevealOnScroll>

                    <RevealOnScroll direction="up" delay={0.3} className="hidden md:block">
                        <div className="h-[1px] w-32 bg-gold/30 mb-8" />
                        <p className="text-sm uppercase tracking-widest text-chocolate/40 font-medium">
                            Atención al cliente <br /> & Ventas corporativas
                        </p>
                    </RevealOnScroll>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
                    {/* LEFT COLUMN: CONTACT INFO & MAP */}
                    <div className="lg:col-span-5 space-y-16">
                        <RevealOnScroll direction="right" className="space-y-12">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-serif text-chocolate">Servicio Personalizado</h2>
                                <p className="text-chocolate/60 font-light leading-relaxed text-lg">
                                    Nuestra vocación es servirte con los más altos estándares de amabilidad y atención al detalle.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
                                <div className="space-y-3 group cursor-pointer">
                                    <div className="flex items-center gap-3 text-gold">
                                        <FontAwesomeIcon icon={faWhatsapp} className="text-xl" />
                                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-chocolate/40 group-hover:text-gold transition-colors">WhatsApp</h3>
                                    </div>
                                    <a href={`https://wa.me/${whatsapp}`} className="block text-base hover:text-gold transition-colors font-medium border-b border-gold/10 pb-2">
                                        {whatsapp.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4')}
                                    </a>
                                </div>

                                <div className="space-y-3 group cursor-pointer">
                                    <div className="flex items-center gap-3 text-gold">
                                        <FontAwesomeIcon icon={faPhone} className="text-lg" />
                                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-chocolate/40 group-hover:text-gold transition-colors">Oficina</h3>
                                    </div>
                                    <a href={`tel:${phone.replace(/\s+/g, '')}`} className="block text-base hover:text-gold transition-colors font-medium border-b border-gold/10 pb-2">{phone}</a>
                                </div>

                                <div className="space-y-3 group cursor-pointer">
                                    <div className="flex items-center gap-3 text-gold">
                                        <FontAwesomeIcon icon={faEnvelope} className="text-lg" />
                                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-chocolate/40 group-hover:text-gold transition-colors">Email</h3>
                                    </div>
                                    <a href={`mailto:${email}`} className="block text-base hover:text-gold transition-colors font-medium border-b border-gold/10 pb-2 truncate">{email}</a>
                                </div>

                                <div className="space-y-3 group cursor-pointer">
                                    <div className="flex items-center gap-3 text-gold">
                                        <FontAwesomeIcon icon={faMapMarkerAlt} className="text-lg" />
                                        <h3 className="text-[10px] uppercase tracking-widest font-bold text-chocolate/40 group-hover:text-gold transition-colors">Dirección</h3>
                                    </div>
                                    <p className="text-sm leading-relaxed text-chocolate/80 whitespace-pre-line border-b border-gold/10 pb-2">
                                        {address}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-center">
                                <span className="text-[9px] uppercase tracking-widest text-chocolate/30 font-bold">Síguenos</span>
                                <div className="h-[1px] w-12 bg-gold/20" />
                                <a href={facebook} target="_blank" className="w-10 h-10 flex items-center justify-center rounded-full border border-gold/10 text-chocolate/40 hover:text-gold hover:border-gold/50 hover:bg-white transition-all duration-500">
                                    <FontAwesomeIcon icon={faFacebook} />
                                </a>
                                <a href={instagram} target="_blank" className="w-10 h-10 flex items-center justify-center rounded-full border border-gold/10 text-chocolate/40 hover:text-gold hover:border-gold/50 hover:bg-white transition-all duration-500">
                                    <FontAwesomeIcon icon={faInstagram} />
                                </a>
                            </div>
                        </RevealOnScroll>

                        {/* MAP INTEGRATION - Hiddable if no URL provided */}
                        {mapsUrl && (
                            <RevealOnScroll direction="up" delay={0.4} className="h-80 md:h-[400px] w-full border border-gold/10 shadow-2xl relative grayscale hover:grayscale-0 transition-all duration-700 overflow-hidden">
                                <iframe
                                    src={mapsUrl.includes('embed') ? mapsUrl : `https://www.google.com/maps/embed?pb=${mapsUrl}`}
                                    className="w-full h-full border-0"
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                                <div className="absolute inset-x-0 bottom-0 p-4 bg-chocolate/90 backdrop-blur-md text-white/80 text-[10px] uppercase tracking-widest flex justify-between items-center">
                                    <span>Visita nuestra fábrica</span>
                                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Ver en Maps</a>
                                </div>
                            </RevealOnScroll>
                        )}
                    </div>

                    {/* RIGHT COLUMN: CONTACT FORM */}
                    <div className="lg:col-span-7">
                        <RevealOnScroll direction="left" delay={0.2} className="relative">
                            {/* Decorative element */}
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold/5 -z-10 blur-3xl" />

                            <div className="bg-white p-8 md:p-16 border border-gold/10 shadow-[0_30px_60px_-15px_rgba(62,39,35,0.1)] relative overflow-hidden">
                                <AnimatePresence mode="wait">
                                    {!submitted ? (
                                        <motion.div
                                            key="contact-form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="space-y-12"
                                        >
                                            <div className="space-y-4">
                                                <h2 className="text-4xl font-serif text-chocolate">Envíanos un mensaje</h2>
                                                <div className="h-[1px] w-20 bg-gold" />
                                                <p className="text-xs text-chocolate/50 uppercase tracking-[0.3em] font-bold italic">
                                                    Recibirás atención en menos de 24 horas hábiles
                                                </p>
                                            </div>

                                            <form className="space-y-10" onSubmit={handleSubmit}>
                                                {/* Honeypot field - Hidden from humans */}
                                                <div className="hidden" aria-hidden="true">
                                                    <input
                                                        type="text"
                                                        id="honeypot"
                                                        value={formData.honeypot}
                                                        onChange={handleChange}
                                                        tabIndex={-1}
                                                        autoComplete="off"
                                                    />
                                                </div>

                                                <div className="space-y-10">
                                                    <div className="relative group">
                                                        <input
                                                            type="text"
                                                            id="name"
                                                            required
                                                            value={formData.name}
                                                            onChange={handleChange}
                                                            className="w-full bg-transparent border-b border-chocolate/10 py-4 outline-none focus:border-gold transition-colors peer text-sm font-medium"
                                                            placeholder=" "
                                                        />
                                                        <label htmlFor="name" className="absolute left-0 top-4 text-[10px] uppercase tracking-widest font-bold text-chocolate/30 transition-all peer-focus:-top-4 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-gold cursor-text">Nombre Completo</label>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                        <div className="relative group">
                                                            <input
                                                                type="tel"
                                                                id="phone"
                                                                required
                                                                value={formData.phone}
                                                                onChange={handleChange}
                                                                maxLength={15} // Suficiente para el formato (000) 000-0000
                                                                className="w-full bg-transparent border-b border-chocolate/10 py-4 outline-none focus:border-gold transition-colors peer text-sm font-medium"
                                                                placeholder=" "
                                                            />
                                                            <label htmlFor="phone" className="absolute left-0 top-4 text-[10px] uppercase tracking-widest font-bold text-chocolate/30 transition-all peer-focus:-top-4 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-gold cursor-text">Teléfono móvil</label>
                                                            <p className="text-[9px] text-chocolate/20 mt-1 uppercase tracking-tighter">Formato: (000) 000-0000</p>
                                                        </div>
                                                        <div className="relative group">
                                                            <input
                                                                type="text"
                                                                id="subject"
                                                                required
                                                                value={formData.subject}
                                                                onChange={handleChange}
                                                                className="w-full bg-transparent border-b border-chocolate/10 py-4 outline-none focus:border-gold transition-colors peer text-sm font-medium"
                                                                placeholder=" "
                                                            />
                                                            <label htmlFor="subject" className="absolute left-0 top-4 text-[10px] uppercase tracking-widest font-bold text-chocolate/30 transition-all peer-focus:-top-4 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-gold cursor-text">Asunto</label>
                                                        </div>
                                                    </div>

                                                    <div className="relative group">
                                                        <textarea
                                                            rows={4}
                                                            id="message"
                                                            required
                                                            value={formData.message}
                                                            onChange={handleChange}
                                                            className="w-full bg-transparent border-b border-chocolate/10 py-4 outline-none focus:border-gold transition-colors peer text-sm font-medium resize-none leading-relaxed"
                                                            placeholder=" "
                                                        />
                                                        <label htmlFor="message" className="absolute left-0 top-4 text-[10px] uppercase tracking-widest font-bold text-chocolate/30 transition-all peer-focus:-top-4 peer-focus:text-gold peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-gold cursor-text">Mensaje</label>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col md:flex-row items-center gap-10 pt-4">
                                                    <div className="space-y-4 w-full md:w-auto">
                                                        <label className="text-[10px] uppercase tracking-widest font-bold text-chocolate/30">Seguridad (Captcha)</label>
                                                        <div className="flex items-center gap-4">
                                                            <div className="bg-chocolate/5 border border-gold/10 px-6 py-4 text-sm font-serif italic tracking-widest text-chocolate/60">
                                                                {captcha.a} + {captcha.b} =
                                                            </div>
                                                            <input
                                                                type="text"
                                                                id="captcha"
                                                                value={formData.captcha}
                                                                onChange={handleChange}
                                                                className="w-24 bg-cream/10 border-b border-gold/20 p-4 focus:border-gold outline-none text-center font-bold"
                                                                placeholder="?"
                                                                required
                                                            />
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting || !!lockoutTime}
                                                        className={`flex-grow w-full md:w-auto mt-6 md:mt-auto px-12 py-5 text-[10px] uppercase tracking-[0.4em] font-bold transition-all duration-500 shadow-xl relative overflow-hidden group ${lockoutTime ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-chocolate text-cream hover:bg-gold'}`}
                                                    >
                                                        <span className={isSubmitting ? 'opacity-0' : 'opacity-100'}>
                                                            {lockoutTime ? 'Temporalmente Bloqueado' : 'Enviar Mensaje'}
                                                        </span>
                                                        {isSubmitting && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <div className="w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                                                    </button>
                                                </div>
                                            </form>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="success-message"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="py-20 text-center space-y-8"
                                        >
                                            <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                                <FontAwesomeIcon icon={faEnvelope} className="text-4xl text-gold" />
                                            </div>
                                            <h2 className="text-4xl font-serif text-chocolate">¡Gracias por escribirnos!</h2>
                                            <p className="text-chocolate/60 font-light max-w-sm mx-auto text-lg">
                                                Tu mensaje ha sido enviado correctamente. Un asesor se pondrá en contacto contigo a la brevedad.
                                            </p>
                                            <button
                                                onClick={resetForm}
                                                className="text-[10px] uppercase tracking-widest text-gold hover:underline font-bold"
                                            >
                                                Enviar otro mensaje
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Background Decorations */}
                                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                    <FontAwesomeIcon icon={faDiamond} className="text-gold text-6xl" />
                                </div>
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>

                {/* FAQ SHORTCUT or SECONDARY CTA */}
                <RevealOnScroll className="mt-40 text-center space-y-8 border-t border-gold/10 pt-20">
                    <p className="text-chocolate/40 text-sm italic font-serif">"La excelencia no es un acto, sino un hábito."</p>
                    <div className="flex justify-center gap-12">
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="text-gold/20 text-4xl"><FontAwesomeIcon icon={faDiamond} /></motion.div>
                    </div>
                </RevealOnScroll>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
