import { faFacebook, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Logo } from '@/components/Logo';
import { Link } from 'react-router-dom';
import bgMobile from '@/assets/fondo_bg.jpeg';
import bgDesktop from '@/assets/fondo-pc.jpg';

const Home: React.FC = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="relative h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-cream cursor-none selection:bg-gold/30 font-sans text-cream">

            {/* --- SOCIAL SIDEBAR (DESKTOP) --- */}
            <aside className="fixed left-0 top-1/2 -translate-y-1/2 z-[60] hidden md:flex flex-col items-center gap-6 px-4 md:px-8 fade-in-left pointer-events-none">
                <div className="w-[1px] h-12 bg-cream/20 mb-2"></div>
                <div className="flex flex-col gap-8 pointer-events-auto">
                    <a
                        href="https://www.facebook.com/arcangel.ceremonias/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center text-cream/50 hover:text-gold transition-all duration-500 hover:-translate-y-1"
                        aria-label="Facebook"
                    >
                        <FontAwesomeIcon icon={faFacebook} className="text-xl md:text-2xl drop-shadow-lg group-hover:drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]" />
                    </a>
                    <a
                        href="https://www.instagram.com/ceremonias.arcangel/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center text-cream/50 hover:text-gold transition-all duration-500 hover:-translate-y-1"
                        aria-label="Instagram"
                    >
                        <FontAwesomeIcon icon={faInstagram} className="text-xl md:text-2xl drop-shadow-lg group-hover:drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]" />
                    </a>
                </div>
                <div className="w-[1px] h-12 bg-cream/20 mt-2"></div>
            </aside>

            {/* --- CUSTOM CURSOR --- */}
            <div
                className="fixed pointer-events-none z-[100] hidden md:block mix-blend-difference"
                style={{
                    left: mousePosition.x,
                    top: mousePosition.y,
                    transform: 'translate(-50%, -50%)'
                }}
            >
                <div className="w-4 h-4 bg-white/80 rounded-full blur-[1px]" />
                <div className="w-12 h-12 border border-white/40 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out scale-100 opacity-50" />
            </div>

            {/* --- BACKGROUND LAYERS --- */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[60s] ease-linear scale-110 motion-safe:animate-[zoom_60s_linear_infinite_alternate] md:hidden"
                style={{
                    backgroundImage: `url('${bgMobile}')`,
                    backgroundAttachment: 'fixed',
                    backgroundPosition: 'center 40%',
                    filter: 'sepia(0.2) brightness(0.9) contrast(0.95)'
                }}
            />
            <div
                className="fixed inset-0 z-0 bg-cover bg-no-repeat transition-transform duration-[60s] ease-linear scale-110 motion-safe:animate-[zoom_60s_linear_infinite_alternate] hidden md:block"
                style={{
                    backgroundImage: `url('${bgDesktop}')`,
                    backgroundAttachment: 'fixed',
                    backgroundPosition: 'right center',
                    filter: 'sepia(0.2) brightness(0.9) contrast(0.95)'
                }}
            />

            <div className="fixed inset-0 z-[1] bg-black/40"></div>
            <div className="fixed inset-0 z-[1] bg-chocolate/40 mix-blend-multiply"></div>
            <div className="fixed inset-0 z-[1] bg-gradient-to-t from-chocolate/95 via-transparent to-chocolate/40 opacity-90"></div>
            <div className="fixed inset-0 z-[1] bg-gradient-to-r from-chocolate/60 via-transparent to-transparent hidden md:block"></div>

            <div className="fixed inset-0 z-[2] opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/marble-similar.png')]"></div>
            <div className="fixed inset-0 z-[2] opacity-[0.07] pointer-events-none bg-noise"></div>

            {/* --- CONTENT --- */}
            <div className="relative z-10 flex flex-col min-h-[100dvh] w-full drop-shadow-lg">

                {/* Top: Logo */}
                <header className="w-full py-6 md:py-8 lg:py-10 flex justify-center fade-in-down shrink-0 px-6">
                    <div className="w-32 md:w-48 lg:w-56 opacity-90 transition-transform duration-700 hover:scale-105 hover:opacity-100 drop-shadow-md">
                        <div className="invert brightness-0 contrast-200 sepia-[.3] hue-rotate-[10deg] saturate-[.5]">
                            <Logo />
                        </div>
                    </div>
                </header>

                {/* Center: Main Message */}
                <main className="flex flex-col items-center justify-center text-center flex-grow px-6 py-4 md:px-12 max-w-5xl mx-auto">
                    <div className="flex flex-col items-center space-y-4 md:space-y-6">
                        <h1 className="flex flex-col items-center justify-center leading-[0.85] font-serif text-cream">
                            <span className="block text-4xl md:text-5xl lg:text-6xl xl:text-[5rem] tracking-tighter mix-blend-overlay reveal-text delay-500 uppercase">
                                Próximamente
                            </span>
                        </h1>

                        <div className="h-[1px] w-16 md:w-20 bg-cream/30 my-2 md:my-3 reveal-line delay-1000"></div>

                        <p className="max-w-2xl text-cream/90 text-sm md:text-base font-light tracking-wide leading-relaxed reveal-text delay-1000 px-4">
                            Este año inicia una nueva etapa en Arcángel!<br /><br />
                            Nos estamos renovando para seguir creciendo con ustedes, manteniendo nuestra esencia con un compromiso aún más fuerte con la calidad y atención al detalle.
                            <span className="hidden lg:inline"><br /></span>
                            <span className="block font-medium text-gold/90 mt-2 hover:text-gold transition-colors duration-300">
                                Próximamente nuevo catálogo disponible!
                            </span>
                        </p>
                    </div>
                </main>

                {/* Bottom: Footer Info */}
                <footer className="w-full py-6 md:py-8 lg:py-10 px-6 flex flex-col items-center justify-end text-center fade-in-up z-20 shrink-0">
                    <div className="flex flex-col items-center gap-4 md:gap-6 lg:gap-8">
                        <div className="flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-24">
                            {/* Call Center */}
                            <div className="flex flex-col items-center gap-1 md:gap-2">
                                <span className="text-[10px] md:text-xs text-cream/70 uppercase tracking-[0.2em] font-medium">
                                    Ventas / Call Center
                                </span>
                                <a
                                    href="https://wa.me/523521681197"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg md:text-xl lg:text-2xl text-cream font-serif tracking-widest hover:text-gold transition-colors duration-300"
                                >
                                    <FontAwesomeIcon icon={faWhatsapp} className="mr-2 text-xl md:text-2xl" /> 352 168 1197
                                </a>
                            </div>

                            {/* Empresa */}
                            <div className="flex flex-col items-center gap-1 md:gap-2">
                                <span className="text-[10px] md:text-xs text-cream/70 uppercase tracking-[0.2em] font-medium">
                                    Empresa
                                </span>
                                <a
                                    href="tel:+523525262502"
                                    className="text-lg md:text-xl lg:text-2xl text-cream font-serif tracking-widest hover:text-gold transition-colors duration-300"
                                >
                                    352 52 62502
                                </a>
                            </div>
                        </div>

                        {/* Social Media (Mobile only, hidden on desktop because of sidebar) */}
                        <div className="flex flex-row items-center justify-center gap-10 pt-4 md:hidden">
                            <a
                                href="https://www.facebook.com/arcangel.ceremonias/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cream/50 hover:text-gold transition-colors duration-300"
                                aria-label="Facebook"
                            >
                                <FontAwesomeIcon icon={faFacebook} className="text-2xl" />
                            </a>
                            <a
                                href="https://www.instagram.com/ceremonias.arcangel/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-cream/50 hover:text-gold transition-colors duration-300"
                                aria-label="Instagram"
                            >
                                <FontAwesomeIcon icon={faInstagram} className="text-2xl" />
                            </a>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Home;