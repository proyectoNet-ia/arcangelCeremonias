import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChartLine,
    faBox,
    faTags,
    faImage,
    faPalette,
    faChevronLeft,
    faChevronRight,
    faSignOutAlt,
    faExternalLinkAlt,
    faDiamond,
    faBars
} from '@fortawesome/free-solid-svg-icons';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: faChartLine },
        { name: 'Productos', path: '/admin/productos', icon: faBox },
        { name: 'Categorías', path: '/admin/categorias', icon: faTags },
        { name: 'Galería Media', path: '/admin/galeria', icon: faImage },
        { name: 'Personalización', path: '/admin/estilo', icon: faPalette },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-slate-800">
            {/* Sidebar */}
            <aside
                className={`bg-[#1A1C1E] text-white fixed h-full left-0 top-0 transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'
                    }`}
            >
                {/* Logo Section */}
                <div className="h-20 flex items-center px-6 border-b border-white/5">
                    <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
                        <div className="w-8 h-8 bg-gold rounded flex items-center justify-center flex-shrink-0">
                            <FontAwesomeIcon icon={faDiamond} className="text-chocolate text-xs" />
                        </div>
                        {isSidebarOpen && (
                            <span className="font-serif text-lg tracking-wider text-gold">ARCÁNGEL</span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-gold text-chocolate'
                                        : 'hover:bg-white/5 text-slate-400'
                                    }`}
                                title={!isSidebarOpen ? item.name : ''}
                            >
                                <FontAwesomeIcon icon={item.icon} className={`text-lg ${isActive ? '' : 'group-hover:text-gold'}`} />
                                {isSidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer Sidebar */}
                <div className="absolute bottom-0 w-full p-4 border-t border-white/5">
                    <Link
                        to="/"
                        className="flex items-center gap-4 p-3 text-slate-400 hover:text-white transition-colors"
                        title={!isSidebarOpen ? 'Ver Sitio' : ''}
                    >
                        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-lg" />
                        {isSidebarOpen && <span className="text-xs uppercase tracking-widest">Regresar al Sitio</span>}
                    </Link>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute -right-3 top-24 bg-gold text-chocolate w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white/10 hover:scale-110 transition-all"
                >
                    <FontAwesomeIcon icon={isSidebarOpen ? faChevronLeft : faChevronRight} className="text-[10px]" />
                </button>
            </aside>

            {/* Main Content Area */}
            <div
                className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'
                    }`}
            >
                {/* Admin Top Header */}
                <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-slate-400">
                            {menuItems.find(i => i.path === location.pathname)?.name || 'Ecosistema Admin'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-700">Administrador</span>
                            <span className="text-[10px] text-gold uppercase tracking-tighter">Acceso Total</span>
                        </div>
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                            <FontAwesomeIcon icon={faSignOutAlt} className="text-slate-400 hover:text-red-500 cursor-pointer transition-colors" />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-8 pb-12">
                    {children}
                </main>
            </div>
        </div>
    );
};
