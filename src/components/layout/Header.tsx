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
    faMapMarkerAlt,
    faFilePdf
} from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { Logo } from '@/components/Logo';
import { Megamenu } from './Megamenu';
import { useConfig } from '@/context/ConfigContext';
import { statsService } from '@/services/statsService';

interface HeaderProps {
    variant?: 'light' | 'dark';
}

export const Header: React.FC<HeaderProps> = ({ variant = 'light' }) => {
    const [isMegamenuOpen, setIsMegamenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileSubmenuOpen, setIsMobileSubmenuOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [scrolled, setScrolled] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { config } = useConfig();

    const headerRef = React.useRef<HTMLDivElement>(null);

    // Detectar altura del header dinámicamente
    useEffect(() => {
        const updateHeight = () => {
            if (headerRef.current) {
                const height = headerRef.current.offsetHeight;
                document.documentElement.style.setProperty('--header-height', `${height}px`);
            }
        };

        const resizeObserver = new ResizeObserver(updateHeight);
        if (headerRef.current) resizeObserver.observe(headerRef.current);

        updateHeight();
        window.addEventListener('scroll', () => {
            setScrolled(window.scrollY > 60);
            updateHeight();
        }, { passive: true });

        return () => resizeObserver.disconnect();
    }, []);

    const whatsapp = config?.whatsapp || '523521681197';
    const phone = config?.phone || '352 52 62502';
    const email = config?.email || 'ventasesbasa@hotmail.com';
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

    // Live Search Logic
    useEffect(() => {
        const performSearch = async () => {
            if (searchTerm.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            try {
                setIsSearching(true);
                const { productService } = await import('@/services/productService');
                const allProducts = await productService.getProducts();

                const filtered = allProducts.filter(p =>
                    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.model_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.material?.toLowerCase().includes(searchTerm.toLowerCase())
                ).slice(0, 6); // Limit to 6 results for live view

                setSearchResults(filtered);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        };

        const timeoutId = setTimeout(performSearch, 300);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const navItems = [
        { name: 'Inicio', path: '/', icon: faHouse },
        { name: 'Colección', path: '/catalogo', hasMegamenu: true, icon: faCrown },
        { name: 'Nosotros', path: '/nosotros', icon: faAward },
        { name: 'Contacto', path: '/contacto', icon: faEnvelope },
    ];

    const isCatalog = location.pathname === '/catalogo';
    // Header ahora siempre sólido para máxima visibilidad según petición del usuario
    const isDark = false;

    return (
        <div ref={headerRef} className="w-full z-50 sticky top-0 bg-white">
            {/* --- SEARCH OVERLAY --- */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute inset-x-0 top-0 bg-chocolate text-cream p-6 md:p-12 z-[60] shadow-2xl min-h-[100dvh] md:min-h-0 overflow-y-auto md:overflow-y-visible"
                    >
                        <div className="max-w-4xl mx-auto flex flex-col gap-8">
                            <div className="flex justify-between items-center text-gold uppercase tracking-[0.4em] text-[10px]">
                                <span>Buscador Editorial</span>
                                <button onClick={() => setIsSearchOpen(false)} className="hover:text-cream transition-colors">
                                    <FontAwesomeIcon icon={faTimes} className="text-lg" />
                                </button>
                            </div>
                            <div className="relative border-b-2 border-gold/30 pb-4 flex items-center group">
                                <FontAwesomeIcon icon={faSearch} className={`text-2xl ${isSearching ? 'animate-pulse text-gold' : 'text-gold/50 group-hover:text-gold'} transition-colors`} />
                                <input
                                    autoFocus
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Encuentra tu prenda ideal..."
                                    className="w-full bg-transparent border-none focus:ring-0 outline-none text-3xl md:text-5xl font-serif text-cream placeholder:text-cream/30 px-6"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            navigate(`/catalogo?search=${encodeURIComponent(searchTerm)}`);
                                            setIsSearchOpen(false);
                                        }
                                    }}
                                />
                            </div>

                            {/* Live Results Panel */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                <AnimatePresence mode="popLayout">
                                    {searchResults.map((product, idx) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-white/5 border border-white/10 p-4 flex gap-4 cursor-pointer hover:bg-white/10 transition-all group"
                                            onClick={() => {
                                                navigate(`/producto/${product.slug}`);
                                                setIsSearchOpen(false);
                                            }}
                                        >
                                            <div className="w-16 h-20 bg-chocolate flex-shrink-0 overflow-hidden">
                                                <img src={product.main_image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="flex flex-col justify-center min-w-0">
                                                <h4 className="text-xs font-bold text-cream uppercase tracking-widest truncate">{product.name}</h4>
                                                <p className="text-[9px] text-gold uppercase tracking-tighter mt-1">Modelo: {product.model_code}</p>
                                                <div className="mt-2 text-[8px] text-cream/40 uppercase tracking-widest flex items-center gap-2">
                                                    <span>Ver Detalle</span>
                                                    <FontAwesomeIcon icon={faChevronDown} className="-rotate-90 text-[6px]" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {searchTerm.length >= 2 && searchResults.length === 0 && !isSearching && (
                                <p className="text-cream/40 text-[11px] uppercase tracking-widest text-center mt-8 italic font-serif">
                                    No encontramos resultados para "{searchTerm}"
                                </p>
                            )}

                            <p className="text-cream/40 text-[10px] uppercase tracking-widest text-center mt-4">
                                {searchTerm.length >= 2 ? (
                                    <>Presiona <span className="text-gold">Enter</span> para ver todos los resultados</>
                                ) : (
                                    <>Escribe al menos 2 caracteres para comenzar la búsqueda</>
                                )}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>


            {/* --- TOP BAR (Desktop Only) --- */}
            <div className="hidden md:block bg-white text-chocolate py-2.5 px-12 border-b border-gold/10">
                <div className="max-w-[1600px] mx-auto flex justify-between items-center text-[9px] uppercase tracking-[0.2em] font-semibold">
                    <div className="flex gap-10">
                        <a
                            href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent("Hola me gustaría recibir más información de los productos")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => statsService.trackWhatsAppClick(window.location.href)}
                            className="hover:text-gold transition-colors flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faWhatsapp} className="text-gold text-[11px]" /> {whatsapp.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4')}
                        </a>
                        <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-gold transition-colors flex items-center gap-2">
                            <FontAwesomeIcon icon={faPhone} className="text-gold text-[11px]" /> Oficina: {phone}
                        </a>
                        {config?.catalog_pdf_url && (
                            <a
                                href={config.catalog_pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gold/5 text-gold hover:bg-gold hover:text-white px-3 py-1 transition-all duration-300 flex items-center gap-2 rounded-full border border-gold/20"
                            >
                                <FontAwesomeIcon icon={faFilePdf} className="text-[10px]" />
                                <span>Catálogo PDF</span>
                            </a>
                        )}
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-chocolate/60">Síguenos:</span>
                        <div className="flex gap-5">
                            <a href={facebook} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-all duration-300 hover:scale-125">
                                <FontAwesomeIcon icon={faFacebook} className="text-[13px]" />
                            </a>
                            <a href={instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-all duration-300 hover:scale-125">
                                <FontAwesomeIcon icon={faInstagram} className="text-[13px]" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN HEADER --- */}
            <header className="w-full bg-white py-3 md:py-4 px-6 md:px-12 border-b border-gold/10 shadow-sm">
                <div className="max-w-[1600px] mx-auto flex justify-between items-center">
                    <Link to="/" className="w-44 md:w-56 hover:scale-105 transition-transform duration-500">
                        <Logo variant="light" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-6 lg:gap-8 text-[11px] uppercase tracking-[0.3em] font-medium h-full items-center">
                        {navItems.map((item) => (
                            <div key={item.name} className="relative h-full flex items-center group">
                                <div className="flex items-center gap-2.5 h-full relative py-2">
                                    <FontAwesomeIcon
                                        icon={item.icon}
                                        className={`text-[12px] ${location.pathname === item.path || (item.hasMegamenu && isCatalog) ? 'text-gold' : 'text-gold/30'} group-hover:text-gold transition-colors duration-500`}
                                    />
                                    
                                    {item.hasMegamenu ? (
                                        <div
                                            className="h-full flex items-center cursor-pointer"
                                            onMouseEnter={openMegamenu}
                                            onMouseLeave={closeMegamenu}
                                        >
                                            <span className={`${isMegamenuOpen || isCatalog ? 'text-gold' : 'text-chocolate/60'} group-hover:text-gold transition-colors flex items-center gap-2 font-bold`}>
                                                {item.name} 
                                                <FontAwesomeIcon 
                                                    icon={faChevronDown} 
                                                    className={`text-[8px] transition-transform duration-500 ${isMegamenuOpen ? 'rotate-180 text-gold' : 'text-gold/40'}`} 
                                                />
                                            </span>

                                            {/* Megamenu Dropdown */}
                                            <Megamenu
                                                isOpen={isMegamenuOpen}
                                                onOpen={openMegamenu}
                                                onClose={closeMegamenu}
                                            />
                                        </div>
                                    ) : (
                                        <Link
                                            to={item.path}
                                            className={`${location.pathname === item.path ? 'text-gold font-bold' : 'text-chocolate/60 font-medium'} hover:text-gold transition-colors flex items-center`}
                                        >
                                            {item.name}
                                        </Link>
                                    )}

                                    {/* Premium Underline Indicator */}
                                    <div className={`absolute bottom-0 left-0 h-[2px] bg-gold transition-all duration-500 ease-out ${location.pathname === item.path || (item.hasMegamenu && isCatalog) ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`} />
                                </div>
                            </div>
                        ))}

                        {/* Search Desktop Toggle */}
                        <div className="flex items-center pl-4 border-l border-gold/10 ml-2 group">
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className={`flex items-center gap-3 transition-colors ${isDark ? 'text-white' : 'text-chocolate/60'} hover:text-gold`}
                            >
                                <FontAwesomeIcon icon={faSearch} className="text-[13px]" />
                                <span className="text-[11px] uppercase tracking-[0.3em] font-bold hidden lg:block opacity-70 group-hover:opacity-100 transition-opacity">Buscar</span>
                            </button>
                        </div>
                    </nav>

                    {/* Mobile Actions */}
                    <div className="flex items-center gap-1 md:hidden">
                        <button
                            className={`p-2 ${isDark ? 'text-white' : 'text-chocolate/50'}`}
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <FontAwesomeIcon icon={faSearch} className="text-xl" />
                        </button>
                        <button
                            className={`p-2 ${isDark ? 'text-white' : 'text-chocolate/50'}`}
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} className="text-2xl" />
                        </button>
                    </div>
                </div>



                {/* --- PRO MOBILE DRAWER --- */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <>
                            {/* Backdrop Blur Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="fixed inset-0 bg-chocolate/60 backdrop-blur-md z-[55] md:hidden"
                            />

                            {/* Main Drawer Panel */}
                            <motion.div
                                initial={{ x: '100%', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: '100%', opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-chocolate z-[60] md:hidden shadow-2xl flex flex-col overflow-y-auto"
                            >
                                {/* Drawer Header */}
                                <div className="flex justify-between items-center p-8 border-b border-gold/10">
                                    <div className="w-32">
                                        <Logo variant="dark" />
                                    </div>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="w-10 h-10 flex items-center justify-center text-gold bg-white/5 rounded-full"
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                                    </button>
                                </div>

                                {/* Navigation items with staggered animation */}
                                <div className="flex-grow py-12 px-8 flex flex-col gap-2">
                                    {navItems.map((item, idx) => (
                                        <motion.div
                                            key={item.name}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + idx * 0.08 }}
                                            className="flex flex-col"
                                        >
                                            <div className="flex items-center justify-between group py-4">
                                                <Link
                                                    to={item.path}
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                    className="flex items-center gap-4 md:gap-6 w-full"
                                                >
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center transition-colors ${location.pathname === item.path ? 'bg-gold text-chocolate shadow-lg shadow-gold/20' : 'bg-white/10 text-gold/80'}`}>
                                                        <FontAwesomeIcon icon={item.icon} className="text-sm" />
                                                    </div>
                                                    <span className={`text-xs md:text-sm uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold transition-all ${location.pathname === item.path ? 'text-gold' : 'text-cream group-hover:text-gold group-hover:translate-x-2'}`}>
                                                        {item.name}
                                                    </span>
                                                </Link>

                                                {item.hasMegamenu && (
                                                    <button
                                                        onClick={() => setIsMobileSubmenuOpen(!isMobileSubmenuOpen)}
                                                        className={`w-10 h-10 transition-transform duration-300 ${isMobileSubmenuOpen ? 'rotate-180 text-gold' : 'text-gold/50'}`}
                                                    >
                                                        <FontAwesomeIcon icon={faChevronDown} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Submenu categories */}
                                            {item.hasMegamenu && isMobileSubmenuOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    className="pl-14 flex flex-col gap-4 py-2"
                                                >
                                                    {categories.map((cat, cIdx) => (
                                                        <motion.div
                                                            key={cat.id}
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.3 + cIdx * 0.05 }}
                                                        >
                                                            <Link
                                                                to={`/catalogo?categoria=${cat.slug}`}
                                                                onClick={() => setIsMobileMenuOpen(false)}
                                                                className="text-[10px] uppercase tracking-[0.2em] text-cream/70 hover:text-gold flex items-center gap-3 py-1"
                                                            >
                                                                <div className="w-1 h-1 rounded-full bg-gold/40" />
                                                                {cat.name}
                                                            </Link>
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Drawer Footer with enhanced info */}
                                <div className="mt-auto bg-black/30 p-8 space-y-8">
                                    <div className="space-y-4">
                                        <p className="text-[10px] uppercase tracking-[0.3em] text-gold font-bold">Asesoría Directa</p>
                                        <a
                                            href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent("Hola me gustaría recibir más información de los productos")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => statsService.trackWhatsAppClick(window.location.href)}
                                            className="flex items-center gap-4 text-cream hover:text-gold transition-colors group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#25D366]/30 group-hover:text-white transition-all">
                                                <FontAwesomeIcon icon={faWhatsapp} className="text-gold/80 group-hover:text-white" />
                                            </div>
                                            <span className="text-[12px] font-medium tracking-tight whitespace-nowrap">Ventas: {whatsapp.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '+$1 $2 $3 $4')}</span>
                                        </a>
                                        <a href={`tel:${phone.replace(/\s+/g, '')}`} className="flex items-center gap-4 text-cream hover:text-gold transition-colors group">
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gold/30 group-hover:text-white transition-all">
                                                <FontAwesomeIcon icon={faPhone} className="text-gold/80 group-hover:text-white" />
                                            </div>
                                            <span className="text-[12px] font-medium tracking-tight">Oficina: {phone}</span>
                                        </a>
                                    </div>

                                    <div className="flex gap-4 pt-4 border-t border-white/10">
                                        <a href={facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-white/10 text-gold rounded-lg hover:text-white hover:bg-gold transition-all">
                                            <FontAwesomeIcon icon={faFacebook} className="text-lg" />
                                        </a>
                                        <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 flex items-center justify-center bg-white/10 text-gold rounded-lg hover:text-white hover:bg-gold transition-all">
                                            <FontAwesomeIcon icon={faInstagram} className="text-lg" />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </header>
        </div>
    );
};
