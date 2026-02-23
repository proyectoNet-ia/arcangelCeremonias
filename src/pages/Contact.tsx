import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp, faFacebook, faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPhone, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const Contact: React.FC = () => {
    return (
        <div className="min-h-screen bg-cream font-sans text-chocolate selection:bg-gold/20">
            <Header />

            <main className="pt-40 pb-20 px-6 md:px-12 max-w-[1200px] mx-auto">
                <div className="text-center space-y-4 mb-20">
                    <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-semibold">Atención Personalizada</span>
                    <h1 className="text-5xl md:text-7xl font-serif">Contacto</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Information Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
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
                                <h3 className="text-[10px] uppercase tracking-widest font-bold">Ventas / WhatsApp</h3>
                                <a href="https://wa.me/523521681197" className="block text-sm hover:text-gold transition-colors">352 168 1197</a>
                            </div>

                            <div className="p-8 border border-gold/10 bg-white/30 backdrop-blur-sm space-y-4 group hover:border-gold/30 transition-colors duration-500">
                                <FontAwesomeIcon icon={faPhone} className="text-gold text-xl" />
                                <h3 className="text-[10px] uppercase tracking-widest font-bold">Oficina</h3>
                                <a href="tel:+523525262502" className="block text-sm hover:text-gold transition-colors">352 52 62502</a>
                            </div>

                            <div className="p-8 border border-gold/10 bg-white/30 backdrop-blur-sm space-y-4 group hover:border-gold/30 transition-colors duration-500">
                                <FontAwesomeIcon icon={faEnvelope} className="text-gold text-xl" />
                                <h3 className="text-[10px] uppercase tracking-widest font-bold">Email</h3>
                                <a href="mailto:ventas@arcangelceremonias.com" className="block text-sm hover:text-gold transition-colors">ventas@arcangelceremonias.com</a>
                            </div>

                            <div className="p-8 border border-gold/10 bg-white/30 backdrop-blur-sm space-y-4 group hover:border-gold/30 transition-colors duration-500">
                                <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gold text-xl" />
                                <h3 className="text-[10px] uppercase tracking-widest font-bold">Dirección</h3>
                                <p className="text-xs leading-relaxed text-chocolate/80">
                                    Igualdad #200, <br />
                                    Ejido de Potrerillos, <br />
                                    La Piedad, Michoacán, MX.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6 pt-4">
                            <a href="https://facebook.com/arcangel.ceremonias" target="_blank" className="w-12 h-12 flex items-center justify-center border border-gold/10 text-chocolate/40 hover:text-gold hover:border-gold/50 transition-all duration-300">
                                <FontAwesomeIcon icon={faFacebook} className="text-lg" />
                            </a>
                            <a href="https://instagram.com/ceremonias.arcangel" target="_blank" className="w-12 h-12 flex items-center justify-center border border-gold/10 text-chocolate/40 hover:text-gold hover:border-gold/50 transition-all duration-300">
                                <FontAwesomeIcon icon={faInstagram} className="text-lg" />
                            </a>
                        </div>
                    </motion.div>

                    {/* Map Placeholder / Future Form */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative min-h-[500px] bg-chocolate/5 border border-gold/10 overflow-hidden"
                    >
                        {/* Here goes a Google Maps iframe or a premium contact form */}
                        <div className="absolute inset-0 flex items-center justify-center p-12 text-center flex-col space-y-6">
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-gold/20 text-6xl" />
                            <p className="text-chocolate/30 font-serif text-xl italic">
                                Ubicados en el corazón textil <br />de La Piedad, Michoacán
                            </p>
                            <a
                                href="https://maps.google.com/?q=Igualdad+200,+Ejido+de+Potrerillos,+La+Piedad,+Michoacán"
                                target="_blank"
                                className="px-10 py-4 bg-chocolate text-cream text-[10px] uppercase tracking-[0.3em] hover:bg-gold transition-colors duration-500"
                            >
                                Abrir en Google Maps
                            </a>
                        </div>
                        <div className="absolute inset-0 bg-gold/5 pointer-events-none"></div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;
