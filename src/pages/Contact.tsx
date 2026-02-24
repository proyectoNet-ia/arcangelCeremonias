import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import toast from 'react-hot-toast';
import { RevealOnScroll } from '@/components/common/RevealOnScroll';
import { useConfig } from '@/context/ConfigContext';

const Contact: React.FC = () => {
    const { config } = useConfig();

    const whatsapp = config?.whatsapp || '523521681197';
    const phone = config?.phone || '352 52 62502';
    const email = config?.email || 'ventas@arcangelceremonias.com';
    const facebook = config?.facebook_url || 'https://facebook.com/arcangel.ceremonias';
    const instagram = config?.instagram_url || 'https://instagram.com/ceremonias.arcangel';
    const address = config?.address || 'Igualdad #200, Ejido de Potrerillos, La Piedad, Michoacán, MX.';
    return (
        <div className="min-h-screen bg-cream font-sans text-chocolate selection:bg-gold/20">
            <Header />

            <main className="pt-40 md:pt-52 pb-20 px-6 md:px-12 max-w-[1200px] mx-auto">
                <div className="text-center space-y-4 mb-20">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-semibold">Atención Personalizada</span>
                    <h1 className="text-5xl md:text-7xl font-serif">Contacto</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Information Cards */}
                    <RevealOnScroll
                        direction="right"
                        className="space-y-12"
                    >
                        <div className="space-y-8">
                            <h2 className="text-2xl font-serif text-chocolate">Estamos para ayudarte</h2>
                            <p className="text-chocolate/60 font-light leading-relaxed">
                                Si tienes dudas sobre nuestras tallas, modelos o necesitas una cotización especial para tu ceremonia, no dudes en contactarnos.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="p-8 border border-gold/10 bg-white/30 backdrop-blur-sm space-y-4 group hover:border-gold/30 transition-colors duration-500">
                                <FontAwesomeIcon icon={faWhatsapp} className="text-gold text-2xl" />
                                <h3 className="text-[10px] uppercase tracking-widest font-bold">Call Center / WhatsApp</h3>
                                <a href={`https://wa.me/${whatsapp}`} className="block text-sm hover:text-gold transition-colors">
                                    {whatsapp.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4')}
                                </a>
                            </div>

                            <div className="p-8 border border-gold/10 bg-white/30 backdrop-blur-sm space-y-4 group hover:border-gold/30 transition-colors duration-500">
                                <FontAwesomeIcon icon={faPhone} className="text-gold text-xl" />
                                <h3 className="text-[10px] uppercase tracking-widest font-bold">Oficina</h3>
                                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="block text-sm hover:text-gold transition-colors">{phone}</a>
                            </div>

                            <div className="p-8 border border-gold/10 bg-white/30 backdrop-blur-sm space-y-4 group hover:border-gold/30 transition-colors duration-500">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gold text-xl" />
                                <h3 className="text-[10px] uppercase tracking-widest font-bold">Email</h3>
                                <a href={`mailto:${email}`} className="block text-sm hover:text-gold transition-colors">{email}</a>
                            </div>

                            <div className="p-8 border border-gold/10 bg-white/30 backdrop-blur-sm space-y-4 group hover:border-gold/30 transition-colors duration-500">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gold text-xl" />
                                <h3 className="text-[10px] uppercase tracking-widest font-bold">Dirección</h3>
                                <p className="text-xs leading-relaxed text-chocolate/80 whitespace-pre-line">
                                    {address}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6 pt-4">
                            <a href={facebook} target="_blank" className="w-12 h-12 flex items-center justify-center border border-gold/10 text-chocolate/40 hover:text-gold hover:border-gold/50 transition-all duration-300">
                                <FontAwesomeIcon icon={faFacebook} className="text-lg" />
                            </a>
                            <a href={instagram} target="_blank" className="w-12 h-12 flex items-center justify-center border border-gold/10 text-chocolate/40 hover:text-gold hover:border-gold/50 transition-all duration-300">
                                <FontAwesomeIcon icon={faInstagram} className="text-lg" />
                            </a>
                        </div>
                    </RevealOnScroll>

                    {/* Contact Form Column */}
                    <RevealOnScroll
                        direction="left"
                        className="p-10 bg-white border border-gold/10 shadow-xl space-y-8"
                    >
                        <div className="space-y-2">
                            <h2 className="text-3xl font-serif text-chocolate">Envíanos un mensaje</h2>
                            <p className="text-xs text-chocolate/50 uppercase tracking-widest">Atención en menos de 24 horas</p>
                        </div>
                        {/* ... form content remains same ... */}
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); toast.success('Mensaje enviado'); }}>
                            {/* Form fields */}
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-chocolate/50">Nombre Completo</label>
                                <input type="text" className="w-full bg-cream/30 border border-gold/10 p-4 focus:border-gold outline-none transition-colors" placeholder="Tu nombre..." required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-chocolate/50">Teléfono</label>
                                    <input type="tel" className="w-full bg-cream/30 border border-gold/10 p-4 focus:border-gold outline-none transition-colors" placeholder="352..." required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-chocolate/50">Asunto</label>
                                    <input type="text" className="w-full bg-cream/30 border border-gold/10 p-4 focus:border-gold outline-none transition-colors" placeholder="Ej: Pedido Especial" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-chocolate/50">Mensaje</label>
                                <textarea rows={4} className="w-full bg-cream/30 border border-gold/10 p-4 focus:border-gold outline-none transition-colors resize-none" placeholder="¿En qué podemos ayudarte?" required></textarea>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest font-bold text-chocolate/50">Verificación (Captcha)</label>
                                <div className="flex items-center gap-4">
                                    <div className="bg-chocolate/5 border border-gold/10 px-4 py-3 text-sm font-mono tracking-widest">
                                        4 + 2 =
                                    </div>
                                    <input type="text" className="w-24 bg-cream/30 border border-gold/10 p-3 focus:border-gold outline-none transition-colors" placeholder="?" required />
                                </div>
                            </div>

                            <button type="submit" className="w-full px-12 py-4 bg-chocolate text-cream text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-gold transition-all duration-500 shadow-lg hover:shadow-gold/20">
                                Enviar Mensaje
                            </button>
                        </form>
                    </RevealOnScroll>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
