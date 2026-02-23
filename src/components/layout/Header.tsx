import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Logo } from '@/components/Logo';
import { Megamenu } from './Megamenu';

interface HeaderProps {
    variant?: 'light' | 'dark';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'light' }) => {
    const [isMegamenuOpen, setIsMegamenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { name: 'Inicio', path: '/' },
        { name: 'Colección', path: '/catalogo', hasMegamenu: true },
        { name: 'Nosotros', path: '/nosotros' },
        { name: 'Contacto', path: '/contacto' },
    ];

    const isCatalog = location.pathname === '/catalogo';
    const isDark = variant === 'dark';

    return (
        <header className={`fixed top-0 w-full z-50 transition-colors duration-500 ${isDark ? 'bg-transparent border-b border-white/5' : 'bg-cream/90 backdrop-blur-md border-b border-gold/10'} px-6 py-4 md:px-12`}>
            <div className="max-w-[1600px] mx-auto flex justify-between items-center h-12">
                <Link to="/" className={`w-24 md:w-32 hover:scale-105 transition-transform duration-500 ${isDark ? 'invert brightness-0 contrast-200 sepia-[.3] hue-rotate-[10deg] saturate-[.5]' : ''}`}>
                    <Logo />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex gap-10 lg:gap-14 text-[10px] uppercase tracking-[0.3em] font-medium h-full items-center">
                    {navItems.map((item) => (
                        item.hasMegamenu ? (
                            <div
                                key={item.name}
                                className="relative h-full flex items-center group cursor-pointer"
                                onMouseEnter={() => setIsMegamenuOpen(true)}
                            >
                                <span className={`${isMegamenuOpen || isCatalog ? 'text-gold' : (isDark ? 'text-cream' : 'text-chocolate')} group-hover:text-gold transition-colors flex items-center gap-2`}>
                                    {item.name} <FontAwesomeIcon icon={faChevronDown} className={`text-[8px] transition-transform duration-300 ${isMegamenuOpen ? 'rotate-180' : ''}`} />
                                </span>
                            </div>
                        ) : (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`${location.pathname === item.path ? 'text-gold' : (isDark ? 'text-cream' : 'text-chocolate')} hover:text-gold transition-colors flex items-center`}
                            >
                                {item.name}
                            </Link>
                        )
                    ))}
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className={`md:hidden p-2 ${isDark ? 'text-cream' : 'text-chocolate'}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="text-xl" />
                </button>
            </div>

            {/* Megamenu Component */}
            <Megamenu
                isOpen={isMegamenuOpen}
                onClose={() => setIsMegamenuOpen(false)}
            />

            {/* Mobile Navigation Drawer (Simple version) */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-cream border-b border-gold/10 py-8 px-6 space-y-6 flex flex-col">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="text-xs uppercase tracking-[0.3em] font-medium text-chocolate hover:text-gold transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
};
