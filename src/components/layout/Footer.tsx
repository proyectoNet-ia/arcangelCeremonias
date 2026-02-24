import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faUsers, faLocationDot, faPhone, faShareNodes, faBriefcase, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { Logo } from '@/components/Logo';
import { RevealOnScroll } from '@/components/common/RevealOnScroll';
import { useConfig } from '@/context/ConfigContext';

export const Footer: React.FC = () => {
    const { config } = useConfig();

    // Default values if config is not yet loaded
    const whatsapp = config?.whatsapp || '523521681197';
    const phone = config?.phone || '352 52 62502';
    const email = config?.email || 'ventas@arcangelceremonias.com';
    const facebook = config?.facebook_url || 'https://www.facebook.com/arcangel.ceremonias/';
    const instagram = config?.instagram_url || 'https://www.instagram.com/ceremonias.arcangel/';
    const address = config?.address || 'Igualdad #200, Ejido de Potrerillos, La Piedad, Michoacán, México';
    const companyName = config?.company_name || 'Arcángel Ceremonias';

    return (
        <footer className="bg-chocolate text-cream py-24 px-6 md:px-12 border-t border-gold/10">
            <div className="max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-12 lg:gap-16">
                    {/* NOSOTROS - Abstract */}
                    <RevealOnScroll className="space-y-8 lg:col-span-1">
                        <div className="flex items-center gap-4">
                            <h3 className="flex items-center gap-2 font-sans text-[11px] text-gold/70 uppercase tracking-[0.5em] font-medium">
                                <FontAwesomeIcon icon={faUsers} className="text-[10px] text-gold/50" />
                                Nosotros
                            </h3>
                        </div>
                        <div className="space-y-4 text-cream/70 text-[10px] md:text-[11px] leading-relaxed font-light text-justify">
                            <p>
                                Con más de 30 años en el ramo textil, nuestra misión es ser líderes en la fabricación y manufactura de productos ceremoniales para las nuevas generaciones, satisfaciendo las necesidades de nuestros clientes con calidad y a un precio justo.
                            </p>
                            <p>
                                Creemos firmemente en el comercio justo y en la vocación de servir a nuestros clientes con valores fundamentales: calidad, honradez, amabilidad y especial atención a los detalles de cada uno de nuestros productos, que están elaborados con la dedicación y talento de muchas personas.
                            </p>
                        </div>
                    </RevealOnScroll>

                    {/* UBICACIÓN */}
                    <RevealOnScroll delay={0.1} className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h3 className="flex items-center gap-2 font-sans text-[11px] text-gold/70 uppercase tracking-[0.5em] font-medium">
                                <FontAwesomeIcon icon={faLocationDot} className="text-[10px] text-gold/50" />
                                Ubicación
                            </h3>
                        </div>
                        <div className="space-y-6 text-[10px] md:text-xs font-medium">
                            {/* Dirección */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[8px] text-gold/50 uppercase tracking-[0.3em]">Dirección</span>
                                <p className="text-cream/60 uppercase tracking-[0.15em] leading-relaxed whitespace-pre-line">
                                    {address}
                                </p>
                            </div>

                            {/* Grupo de Empresas */}
                            <div className="flex flex-col gap-3 pt-2 border-t border-gold/10">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBriefcase} className="text-[8px] text-gold/40" />
                                    <span className="text-[8px] text-gold/50 uppercase tracking-[0.3em]">Grupo de Empresas</span>
                                </div>
                                <a
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-2 text-cream/40 hover:text-gold transition-colors duration-300"
                                >
                                    <span className="text-[9px] uppercase tracking-[0.3em] font-semibold">Grupo ESBASA</span>
                                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[7px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </a>
                                <a
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-2 text-cream/40 hover:text-gold transition-colors duration-300"
                                >
                                    <span className="text-[9px] uppercase tracking-[0.3em] font-semibold">Uniformes ESBASA</span>
                                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[7px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </a>
                            </div>
                        </div>
                    </RevealOnScroll>


                    {/* CONTACTO */}
                    <RevealOnScroll delay={0.2} className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h3 className="flex items-center gap-2 font-sans text-[11px] text-gold/70 uppercase tracking-[0.5em] font-medium">
                                <FontAwesomeIcon icon={faPhone} className="text-[10px] text-gold/50" />
                                Contacto
                            </h3>
                        </div>
                        <div className="space-y-4 text-cream/60 text-[10px] md:text-xs uppercase tracking-[0.2em] font-medium">
                            <div className="flex flex-col gap-2">
                                <span className="text-[8px] text-gold/50">Call Center / WhatsApp</span>
                                <a href={`https://wa.me/${whatsapp}`} className="text-cream hover:text-gold transition-colors duration-300">
                                    {whatsapp.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4')}
                                </a>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[8px] text-gold/50">Oficina</span>
                                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-cream hover:text-gold transition-colors duration-300">{phone}</a>
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <span className="text-[8px] text-gold/50">Email</span>
                                <a href={`mailto:${email}`} className="text-cream hover:text-gold transition-colors duration-300 lowercase tracking-widest">{email}</a>
                            </div>
                        </div>
                    </RevealOnScroll>

                    {/* SOCIAL */}
                    <RevealOnScroll delay={0.3} className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h3 className="flex items-center gap-2 font-sans text-[11px] text-gold/70 uppercase tracking-[0.5em] font-medium">
                                <FontAwesomeIcon icon={faShareNodes} className="text-[10px] text-gold/50" />
                                Social
                            </h3>
                        </div>
                        <div className="flex gap-8 items-center">
                            <a
                                href={facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cream/40 hover:text-gold transition-all duration-300 hover:-translate-y-1"
                                aria-label="Facebook"
                            >
                                <FontAwesomeIcon icon={faFacebook} className="text-2xl" />
                            </a>
                            <a
                                href={instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cream/40 hover:text-gold transition-all duration-300 hover:-translate-y-1"
                                aria-label="Instagram"
                            >
                                <FontAwesomeIcon icon={faInstagram} className="text-2xl" />
                            </a>
                            <a
                                href={`https://wa.me/${whatsapp}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cream/40 hover:text-gold transition-all duration-300 hover:-translate-y-1"
                                aria-label="WhatsApp"
                            >
                                <FontAwesomeIcon icon={faWhatsapp} className="text-2xl" />
                            </a>
                        </div>
                        <div className="pt-8 opacity-20 hover:opacity-100 transition-opacity duration-700 w-40">
                            <div className="invert brightness-0">
                                <Logo />
                            </div>
                        </div>
                    </RevealOnScroll>
                </div>


                {/* ── Copyright bar ── */}
                <div className="mt-10 pt-8 border-t border-gold/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-medium text-cream/30">
                    <p>© {new Date().getFullYear()} {companyName}. Todos los derechos reservados.</p>
                    <div className="flex gap-8">
                        <Link to="/admin" className="hover:text-gold transition-colors">Admin</Link>
                        <Link to="#" className="hover:text-gold transition-colors">Términos & Condiciones</Link>
                        <Link to="#" className="hover:text-gold transition-colors">Aviso de Privacidad</Link>
                    </div>
                </div>
            </div >
        </footer >
    );
};
