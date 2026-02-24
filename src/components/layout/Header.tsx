import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';
import {
    faChevronDown,
    faBars,
    faTimes,
    faDiamond,
    faPhone,
    faHouse,
    faCrown,
    faAward,
    faEnvelope,
    faSearch,
    faMapMarkerAlt
} from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Logo } from '@/components/Logo';
import { Megamenu } from './Megamenu';
import { useConfig } from '@/context/ConfigContext';

interface HeaderProps {
    variant?: 'light' | 'dark';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'light' }) => {
    const [isMegamenuOpen, setIsMegamenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileSubmenuOpen, setIsMobileSubmenuOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const location = useLocation();
    const navigate = useNavigate();
    const { config } = useConfig();

    const whatsapp = config?.whatsapp || '523521681197';
    const phone = config?.phone || '352 52 62502';
    const email = config?.email || 'ventas@arcangelceremonias.com';
    const facebook = config?.facebook_url || 'https://facebook.com/arcangel.ceremonias';
    const instagram = config?.instagram_url || 'https://instagram.com/ceremonias.arcangel';

    const [closeTimeout, setCloseTimeout] = useState<any>(null);

    const openMegamenu = () => {
        if (closeTimeout) clearTimeout(closeTimeout);
        setIsMegamenuOpen(true);
    };

    const closeMegamenu = () => {
        const timeout = setTimeout(() => {
            setIsMegamenuOpen(false);
        }, 150);
        setCloseTimeout(timeout);
    };

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const { productService } = await import('@/services/productService');
                const data = await productService.getCategories();
                setCategories(data.filter((c: any) => !c.parent_id));
            } catch (err) {
                console.error("Error loading categories for mobile menu:", err);
            }
        };
        loadCategories();
    }, []);

    const navItems = [
        { name: 'Inicio', path: '/', icon: faHouse },
        { name: 'Colección', path: '/catalogo', hasMegamenu: true, icon: faCrown },
        { name: 'Nosotros', path: '/nosotros', icon: faAward },
        { name: 'Contacto', path: '/contacto', icon: faEnvelope },
    ];

    const isCatalog = location.pathname === '/catalogo';
    const isDark = variant === 'dark';

    return (
        <div className={`fixed top-0 w-full z-50 transition-all duration-500 ${!isDark ? 'shadow-2xl shadow-chocolate/40' : ''}`}>
            {/* --- SEARCH OVERLAY --- */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute inset-x-0 top-0 bg-chocolate text-cream p-12 z-[60] shadow-2xl"
                    >
                        <div className="max-w-4xl mx-auto flex flex-col gap-8">
                            <div className="flex justify-between items-center text-gold uppercase tracking-[0.4em] text-[10px]">
                                <span>Buscador Editorial</span>
                                <button onClick={() => setIsSearchOpen(false)} className="hover:text-cream transition-colors">
                                    <FontAwesomeIcon icon={faTimes} className="text-lg" />
                                </button>
                            </div>
                            <div className="relative border-b-2 border-gold/30 pb-4 flex items-center group">
                                <FontAwesomeIcon icon={faSearch} className="text-2xl text-gold/50 group-hover:text-gold transition-colors" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Encuentra tu prenda ideal..."
                                    className="w-full bg-transparent border-none focus:ring-0 outline-none text-3xl md:text-5xl font-serif text-cream placeholder:text-cream/30 px-6"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = (e.target as HTMLInputElement).value;
                                            navigate(`/catalogo?search=${encodeURIComponent(val)}`);
                                            setIsSearchOpen(false);
                                        }
                                    }}
                                />
                            </div>
                            <p className="text-cream/40 text-[10px] uppercase tracking-widest text-center mt-4">
                                Presiona <span className="text-gold">Enter</span> para ver los resultados en el catálogo
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- TOP BAR (Desktop Only) --- */}
            <div className="hidden md:block bg-chocolate text-cream py-2 px-12 border-b border-gold/10">
                <div className="max-w-[1600px] mx-auto flex justify-between items-center text-[9px] uppercase tracking-[0.2em] font-medium">
                    <div className="flex gap-8">
                        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors flex items-center gap-2">
                            <FontAwesomeIcon icon={faWhatsapp} className="text-gold text-[10px]" /> {whatsapp.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4')}
                        </a>
                        <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-gold transition-colors flex items-center gap-2">
                            <FontAwesomeIcon icon={faPhone} className="text-gold text-[10px]" /> Oficina: {phone}
                        </a>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-gold/80">Síguenos:</span>
                        <div className="flex gap-4">
                            <a href={facebook} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-all duration-300 hover:scale-125">
                                <FontAwesomeIcon icon={faFacebook} className="text-[12px]" />
                            </a>
                            <a href={instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-all duration-300 hover:scale-125">
                                <FontAwesomeIcon icon={faInstagram} className="text-[12px]" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN HEADER --- */}
            <header className={`w-full transition-colors duration-500 ${isDark ? 'bg-transparent border-b border-white/5' : 'bg-cream/90 backdrop-blur-md border-b border-gold/10'} px-6 py-6 md:py-4 md:px-12`}>
                <div className="max-w-[1600px] mx-auto flex justify-between items-center">
                    <Link to="/" className={`w-44 md:w-56 hover:scale-105 transition-transform duration-500 ${isDark ? 'invert brightness-0 contrast-200 sepia-[.3] hue-rotate-[10deg] saturate-[.5]' : ''}`}>
                        <Logo />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-10 lg:gap-14 text-[11px] uppercase tracking-[0.3em] font-medium h-full items-center">
                        {navItems.map((item) => (
                            <div key={item.name} className="flex items-center gap-3">
                                <FontAwesomeIcon
                                    icon={item.icon}
                                    className={`text-[13px] ${location.pathname === item.path || (item.hasMegamenu && isCatalog) ? 'text-gold' : 'text-gold/50'} transition-colors duration-300`}
                                />
                                {item.hasMegamenu ? (
                                    <div
                                        className="relative h-full flex items-center group cursor-pointer"
                                        onMouseEnter={openMegamenu}
                                        onMouseLeave={closeMegamenu}
                                    >
                                        <span className={`${isMegamenuOpen || isCatalog ? 'text-gold' : (isDark ? 'text-cream/60' : 'text-chocolate/60')} group-hover:text-chocolate transition-colors flex items-center gap-2 group-hover:text-gold`}>
                                            {item.name} <FontAwesomeIcon icon={faChevronDown} className={`text-[9px] transition-transform duration-300 ${isMegamenuOpen ? 'rotate-180' : ''}`} />
                                        </span>
                                    </div>
                                ) : (
                                    <Link
                                        to={item.path}
                                        className={`${location.pathname === item.path ? 'text-gold' : (isDark ? 'text-cream/60' : 'text-chocolate/60')} hover:text-gold transition-colors flex items-center`}
                                    >
                                        {item.name}
                                    </Link>
                                )}
                            </div>
                        ))}

                        {/* Search Desktop Toggle */}
                        <div className="flex items-center pl-6 border-l border-gold/10 ml-4 group">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className={`flex items-center gap-3 transition-colors ${isDark ? 'text-cream/60' : 'text-chocolate/60'} hover:text-gold`}
                            >
                                <FontAwesomeIcon icon={faSearch} className="text-[13px]" />
                                <span className="text-[11px] uppercase tracking-[0.3em] font-medium hidden lg:block opacity-70 group-hover:opacity-100 transition-opacity">Buscar</span>
                            </button>
                        </div>
                    </nav>

                    {/* Mobile Actions */}
                    <div className="flex items-center gap-2 md:hidden">
                        <button
                            className={`p-2 ${isDark ? 'text-cream/70' : 'text-chocolate/70'}`}
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <FontAwesomeIcon icon={faSearch} className="text-2xl" />
                        </button>
                        <button
                            className={`p-2 ${isDark ? 'text-cream/70' : 'text-chocolate/70'}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="text-3xl" />
                        </button>
                    </div>
                </div>

                {/* Megamenu Component */}
                <Megamenu
                    isOpen={isMegamenuOpen}
                    onOpen={openMegamenu}
                    onClose={closeMegamenu}
                />

                {/* Mobile Navigation Drawer */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-chocolate border-b border-gold/20 py-12 px-8 flex flex-col shadow-2xl animate-fade-in-down z-[50]">
                        <div className="flex flex-col gap-8">
                            {navItems.map((item, idx) => (
                                <div key={item.name} className="flex flex-col gap-6">
                                    <div className="flex items-center justify-between group">
                                        <Link
                                            to={item.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-6"
                                        >
                                            <FontAwesomeIcon
                                                icon={item.icon}
                                                className={`text-lg ${location.pathname === item.path ? 'text-gold' : 'text-gold/30'}`}
                                            />
                                            <span className={`text-sm uppercase tracking-[0.4em] font-medium transition-colors duration-300 ${location.pathname === item.path ? 'text-gold' : 'text-cream group-hover:text-gold'}`}>
                                                {item.name}
                                            </span>
                                        </Link>

                                        {item.hasMegamenu && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsMobileSubmenuOpen(!isMobileSubmenuOpen);
                                                }}
                                                className="p-2 text-gold/50"
                                            >
                                                <FontAwesomeIcon icon={faChevronDown} className={`text-xs transition-transform duration-300 ${isMobileSubmenuOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                        )}
                                    </div>

                                    {/* --- MOBILE SUBMENU (Simple categories) --- */}
                                    {item.hasMegamenu && isMobileSubmenuOpen && (
                                        <div className="pl-12 flex flex-col gap-4 animate-fade-in">
                                            {categories.map((cat) => (
                                                <Link
                                                    key={cat.id}
                                                    to={`/catalogo?categoria=${cat.slug}`}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="text-[11px] uppercase tracking-[0.2em] text-cream/60 hover:text-gold transition-colors flex items-center gap-3"
                                                >
                                                    <div className="w-1 h-1 rounded-full bg-gold/30" />
                                                    {cat.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Mobile Footer Info */}
                        <div className="mt-12 pt-8 border-t border-white/5 space-y-6">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-gold/50 font-semibold">Atención al Cliente</p>
                            <div className="space-y-4">
                                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-cream/70 text-xs hover:text-gold transition-colors">
                                    <FontAwesomeIcon icon={faWhatsapp} className="text-gold w-4" />
                                    <span>Ventas: {whatsapp.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4')}</span>
                                </a>
                                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center gap-4 text-cream/70 text-xs hover:text-gold transition-colors">
                                    <FontAwesomeIcon icon={faPhone} className="text-gold w-4" />
                                    <span>Oficina: {phone}</span>
                                </a>
                                <a href={`mailto:${email}`} className="flex items-center gap-4 text-cream/70 text-xs hover:text-gold transition-colors">
                                    <FontAwesomeIcon icon={faEnvelope} className="text-gold w-4" />
                                    <span>{email}</span>
                                </a>
                                <a
                                    href={`https://wa.me/${whatsapp}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-6 w-full py-4 bg-gold text-chocolate font-bold text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:bg-cream transition-all duration-500 active:scale-95"
                                >
                                    <FontAwesomeIcon icon={faWhatsapp} className="text-lg" />
                                    Chat de Ventas
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
};
