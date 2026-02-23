import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Logo } from '@/components/Logo';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-chocolate text-cream py-24 px-6 md:px-12 border-t border-gold/10">
            <div className="max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12 lg:gap-24">
                    {/* UBICACIÓN */}
                    <div className="space-y-8">
                        <h3 className="font-serif text-gold text-sm md:text-base lg:text-lg uppercase tracking-[0.4em]">Ubicación</h3>
                        <div className="space-y-4 text-cream/60 text-[10px] md:text-xs uppercase tracking-[0.2em] leading-loose font-medium">
                            <p>Calle Pino Suárez #123<br />Col. Centro, CP 59300<br />La Piedad, Michoacán, México</p>
                            <a
                                href="https://maps.google.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-gold hover:text-cream transition-colors duration-300 mt-2"
                            >
                                Ver en Google Maps
                            </a>
                        </div>
                    </div>

                    {/* CONTACTO */}
                    <div className="space-y-8">
                        <h3 className="font-serif text-gold text-sm md:text-base lg:text-lg uppercase tracking-[0.4em]">Contacto</h3>
                        <div className="space-y-4 text-cream/60 text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium">
                            <div className="flex flex-col gap-2">
                                <span className="text-[8px] text-gold/50">Ventas / WhatsApp</span>
                                <a href="https://wa.me/523521681197" className="text-cream hover:text-gold transition-colors duration-300">352 168 1197</a>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[8px] text-gold/50">Oficina</span>
                                <a href="tel:+523525262502" className="text-cream hover:text-gold transition-colors duration-300">352 52 62502</a>
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <span className="text-[8px] text-gold/50">Email</span>
                                <a href="mailto:ventas@arcangelceremonias.com" className="text-cream hover:text-gold transition-colors duration-300 lowercase tracking-widest">ventas@arcangelceremonias.com</a>
                            </div>
                        </div>
                    </div>

                    {/* SOCIAL */}
                    <div className="space-y-8">
                        <h3 className="font-serif text-gold text-sm md:text-base lg:text-lg uppercase tracking-[0.4em]">Social</h3>
                        <div className="flex gap-8 items-center">
                            <a
                                href="https://www.facebook.com/arcangel.ceremonias/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cream/40 hover:text-gold transition-all duration-300 hover:-translate-y-1"
                                aria-label="Facebook"
                            >
                                <FontAwesomeIcon icon={faFacebook} className="text-2xl" />
                            </a>
                            <a
                                href="https://www.instagram.com/ceremonias.arcangel/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cream/40 hover:text-gold transition-all duration-300 hover:-translate-y-1"
                                aria-label="Instagram"
                            >
                                <FontAwesomeIcon icon={faInstagram} className="text-2xl" />
                            </a>
                            <a
                                href="https://wa.me/523521681197"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cream/40 hover:text-gold transition-all duration-300 hover:-translate-y-1"
                                aria-label="WhatsApp"
                            >
                                <FontAwesomeIcon icon={faWhatsapp} className="text-2xl" />
                            </a>
                        </div>
                        <div className="pt-8 opacity-20 hover:opacity-100 transition-opacity duration-700 w-32">
                            <div className="invert brightness-0">
                                <Logo />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-24 pt-8 border-t border-gold/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-medium text-cream/30">
                    <p>© 2026 Arcángel Ceremonias. Todos los derechos reservados.</p>
                    <div className="flex gap-8">
                        <Link to="#" className="hover:text-gold transition-colors">Términos & Condiciones</Link>
                        <Link to="#" className="hover:text-gold transition-colors">Aviso de Privacidad</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
