import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import toast from 'react-hot-toast';
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
    faBars,
    faInbox,
    faUsersCog
} from '@fortawesome/free-solid-svg-icons';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { user, profile, isAdmin, signOut } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: faChartLine },
        { name: 'Productos', path: '/admin/productos', icon: faBox },
        { name: 'Categorías', path: '/admin/categorias', icon: faTags },
        { name: 'Hero Slider', path: '/admin/hero', icon: faImage },
        { name: 'Galería Media', path: '/admin/galeria', icon: faImage },
        { name: 'Mensajes', path: '/admin/mensajes', icon: faInbox },
        { name: 'Configuración', path: '/admin/configuracion', icon: faPalette },
        ...(isAdmin ? [{ name: 'Usuarios', path: '/admin/usuarios', icon: faUsersCog }] : []),
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
                            <span className="text-xs font-bold text-slate-700">{profile?.full_name || user?.email?.split('@')[0] || 'Administrador'}</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-[8px] uppercase tracking-tighter px-2 py-0.5 rounded-full font-bold ${isAdmin ? 'bg-gold/10 text-gold' : 'bg-slate-100 text-slate-400'}`}>
                                    {profile?.role || 'Visitante'}
                                </span>
                                <span className="text-[10px] text-slate-400 uppercase tracking-tighter truncate max-w-[150px]">{user?.email}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                signOut();
                                toast.success('Cerrando sesión...');
                            }}
                            className="w-10 h-10 bg-slate-100/50 rounded-full flex items-center justify-center border border-slate-200 hover:bg-red-50 hover:border-red-200 transition-all group"
                            title="Cerrar Sesión"
                        >
                            <FontAwesomeIcon icon={faSignOutAlt} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                        </button>
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
