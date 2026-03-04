import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
    const { user, profile, loading, isAdmin, signOut } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-cream flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-gold/20 border-t-gold rounded-full animate-spin" />
            </div>
        );
    }

    // 1. No hay usuario autenticado
    if (!user) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // 2. Usuario autenticado pero sin perfil (no autorizado o error en DB)
    if (!profile) {
        return (
            <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <svg className="w-8 h-8 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-serif text-chocolate mb-2">Acceso No Autorizado</h2>
                <p className="text-chocolate/60 max-w-sm mb-8 text-sm">
                    Tu cuenta está autenticada pero no tiene permisos de acceso al CMS.
                    Contacta al administrador para que habilite tu perfil.
                </p>
                <button
                    onClick={() => signOut()}
                    className="bg-chocolate text-cream px-10 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-gold transition-all shadow-xl"
                >
                    Cerrar Sesión
                </button>
            </div>
        );
    }

    // 3. Ruta requiere ser Admin y el usuario es solo Editor
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
};
