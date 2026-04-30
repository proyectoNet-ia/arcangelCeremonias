import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faUsers, faLocationDot, faPhone, faShareNodes, faBriefcase, faArrowUpRightFromSquare, faLock, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { Logo } from '@/components/Logo';
import { RevealOnScroll } from '@/components/common/RevealOnScroll';
import { useConfig } from '@/context/ConfigContext';
import { statsService } from '@/services/statsService';

export const Footer: React.FC = () => {
    const { config } = useConfig();

    // Default values if config is not yet loaded
    const whatsapp = config?.whatsapp || '523521681197';
    const phone = config?.phone || '352 52 62502';
    const email = config?.email || 'ventasesbasa@hotmail.com';
    const facebook = config?.facebook_url || 'https://www.facebook.com/arcangel.ceremonias/';
    const instagram = config?.instagram_url || 'https://www.instagram.com/ceremonias.arcangel/';
    const address = config?.address || 'Igualdad #200, Ejido de Potrerillos, La Piedad, Michoacán, México';
    const companyName = config?.company_name || 'Grupo Espinoza Baez S.A. de C.V.';

    const handleWhatsAppClick = (msg?: string) => {
        statsService.trackWhatsAppClick(window.location.href);
        const phone = whatsapp.replace(/\D/g, '');
        const url = `https://wa.me/${phone}${msg ? `?text=${encodeURIComponent(msg)}` : ''}`;
        window.open(url, 'whatsapp_contact', 'noopener,noreferrer');
    };

    return (
        <footer className="bg-chocolate text-cream py-24 px-6 md:px-12 border-t border-gold/10">
            <div className="max-w-[1600px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-12 lg:gap-16">
                    {/* NOSOTROS - Abstract - Hidden on mobile per user request */}
                    <RevealOnScroll className="hidden md:block space-y-8 lg:col-span-1">
                        <div className="flex items-center gap-4">
                            <h3 className="flex items-center gap-2 font-sans text-[11px] text-gold/70 uppercase tracking-[0.5em] font-medium">
                                <FontAwesomeIcon icon={faUsers} className="text-[10px] text-gold/50" />
                                Nosotros
                            </h3>
                        </div>
                        <div className="space-y-4 text-white md:text-cream/70 text-[10px] md:text-[11px] leading-relaxed font-light text-justify">
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
                            <h3 className="flex items-center gap-2 font-sans text-[16px] md:text-[13px] text-gold/70 uppercase tracking-[0.5em] font-medium">
                                <FontAwesomeIcon icon={faLocationDot} className="text-[12px] text-gold/50" />
                                Ubicación
                            </h3>
                        </div>
                        <div className="space-y-6 text-[11px] md:text-xs font-normal">
                            {/* Dirección */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[12px] md:text-[10px] text-gold/50 tracking-[0.3em] font-bold uppercase">Dirección</span>
                                <p className="text-cream/70 text-[14px] md:text-[13px] tracking-[0.05em] leading-relaxed whitespace-pre-line">
                                    {address}
                                </p>
                            </div>

                            {/* Grupo de Empresas */}
                            <div className="flex flex-col gap-3 pt-2 border-t border-gold/10">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon icon={faBriefcase} className="text-[11px] md:text-[9px] text-gold/40" />
                                    <span className="text-[12px] md:text-[10px] text-gold/50 uppercase tracking-[0.3em]">Grupo de Empresas</span>
                                </div>
                                <a
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-2 text-cream/40 hover:text-gold transition-colors duration-300"
                                >
                                    <span className="text-[11px] md:text-[9px] tracking-[0.1em] font-normal">Grupo ESBASA</span>
                                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[7px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </a>
                                <a
                                    href="#"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-2 text-cream/40 hover:text-gold transition-colors duration-300"
                                >
                                    <span className="text-[11px] md:text-[9px] tracking-[0.1em] font-normal">Uniformes ESBASA</span>
                                    <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-[7px] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </a>
                            </div>
                        </div>
                    </RevealOnScroll>


                    {/* CONTACTO */}
                    <RevealOnScroll delay={0.2} className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h3 className="flex items-center gap-2 font-sans text-[16px] md:text-[13px] text-gold/70 uppercase tracking-[0.5em] font-medium">
                                <FontAwesomeIcon icon={faPhone} className="text-[12px] text-gold/50" />
                                Contacto
                            </h3>
                        </div>
                        <div className="space-y-4 text-cream/70 text-[14px] md:text-[13px] font-normal">
                            <div className="flex flex-col gap-2">
                                <span className="text-[12px] md:text-[10px] text-gold/50 tracking-[0.2em] font-bold uppercase">Call Center / WhatsApp</span>
                                <button
                                    onClick={() => handleWhatsAppClick()}
                                    className="text-cream hover:text-gold transition-colors duration-300 text-left font-medium"
                                >
                                    {whatsapp.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4')}
                                </button>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-[12px] md:text-[10px] text-gold/50 tracking-[0.2em] font-bold uppercase">Oficina</span>
                                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-cream hover:text-gold transition-colors duration-300 font-medium">{phone}</a>
                            </div>
                            <div className="flex flex-col gap-2 pt-2">
                                <span className="text-[12px] md:text-[10px] text-gold/50 tracking-[0.2em] font-bold uppercase">Email</span>
                                <a href={`mailto:${email}`} className="text-cream hover:text-gold transition-colors duration-300 lowercase tracking-widest">{email}</a>
                            </div>
                            {config?.catalog_pdf_url && (
                                <div className="flex flex-col gap-2 pt-4 border-t border-gold/10">
                                    <span className="text-[12px] md:text-[10px] text-gold/50 tracking-[0.2em] font-bold uppercase">Catálogo 2026</span>
                                    <a
                                        href={config.catalog_pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-cream hover:text-gold transition-colors duration-300 flex items-center gap-2 font-medium"
                                    >
                                        <FontAwesomeIcon icon={faFilePdf} className="text-gold" />
                                        <span>Descargar PDF</span>
                                    </a>
                                </div>
                            )}
                        </div>
                    </RevealOnScroll>

                    {/* SOCIAL */}
                    <RevealOnScroll delay={0.3} className="space-y-8">
                        <div className="flex items-center gap-4">
                            <h3 className="flex items-center gap-2 font-sans text-[16px] md:text-[13px] text-gold/70 uppercase tracking-[0.5em] font-medium">
                                <FontAwesomeIcon icon={faShareNodes} className="text-[12px] text-gold/50" />
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
                            <button
                                onClick={() => handleWhatsAppClick()}
                                className="text-cream/40 hover:text-gold transition-all duration-300 hover:-translate-y-1"
                                aria-label="WhatsApp"
                            >
                                <FontAwesomeIcon icon={faWhatsapp} className="text-2xl" />
                            </button>
                        </div>
                        <div className="pt-8 opacity-50 md:opacity-20 hover:opacity-100 transition-opacity duration-700 w-40">
                            <Logo variant="dark" />
                        </div>
                    </RevealOnScroll>
                </div>


                {/* ── Copyright bar ── */}
                <div className="mt-10 pt-8 border-t border-gold/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-[12px] md:text-[10px] tracking-[0.1em] font-medium text-cream/30">
                    <p>© 2026. Grupo Espinoza Baez S.A. de C.V. Todos los derechos reservados.</p>
                    <div className="flex flex-wrap gap-x-8 gap-y-4 items-center">
                        <Link to="#" className="hover:text-gold transition-colors">Términos & Condiciones</Link>
                        <Link to="#" className="hover:text-gold transition-colors">Aviso de Privacidad</Link>
                        <Link
                            to="/admin/login"
                            className="text-cream/10 hover:text-gold transition-colors duration-500 flex items-center gap-1 group"
                            title="Acceso Administrativo"
                        >
                            <FontAwesomeIcon icon={faLock} className="text-[12px] group-hover:scale-110 transition-transform" />
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-75 origin-left">Acceso</span>
                        </Link>
                    </div>
                </div>
            </div >
        </footer >
    );
};
