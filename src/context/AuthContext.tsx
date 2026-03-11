import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    role: 'admin' | 'editor';
}

interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    isAdmin: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            console.log('Fetching profile for:', userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.warn('Profile fetch error (possibly no profile yet):', error.message);
                throw error;
            }
            console.log('Profile loaded:', data.full_name, data.role);
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
        }
    };

    useEffect(() => {
        if (!supabase) {
            console.warn('Supabase client not initialized');
            setLoading(false);
            return;
        }

        const initialize = async () => {
            const timeoutId = setTimeout(() => {
                setLoading(false);
                console.warn('Auth initialization reached failsafe timeout (2.5s) - Proceeding to keep UI responsive.');
            }, 2500);

            try {
                console.log('Initializing AuthContext...');
                // Carrera entre getSession y un timeout de 2.5s para no congelar la UI
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Session fetch timeout')), 2500)
                );

                const result = await Promise.race([sessionPromise, timeoutPromise]).catch(e => {
                    console.error('Session get error or timeout:', e);
                    return { data: { session: null }, error: e };
                });

                const session = (result as any)?.data?.session ?? null;
                const sessionError = (result as any)?.error ?? null;

                if (sessionError) {
                    console.warn('Session error suppressed for stability:', sessionError);
                }

                const currentUser = session?.user ?? null;
                setUser(currentUser);

                if (currentUser) {
                    console.log('User found, fetching profile...', currentUser.id);
                    await fetchProfile(currentUser.id);
                } else {
                    console.log('No active session found during initialization.');
                }
            } catch (err) {
                console.error('Initialization caught crash:', err);
                // Fallback to null user so the app doesn't stay loading
                setUser(null);
            } finally {
                // Ensure timeout is cleared as soon as we finish the try/catch
                clearTimeout(timeoutId);
                console.log('Finalizing AuthContext initialization.');
                setLoading(false);
            }
        };

        initialize();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);

            const currentUser = session?.user ?? null;

            if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                // Solo activamos loading si no teníamos usuario previo (evita parpadeo al cambiar foco)
                const shouldShowLoading = !user && event !== 'TOKEN_REFRESHED';

                if (shouldShowLoading) setLoading(true);

                setUser(currentUser);
                if (currentUser && (!profile || profile.id !== currentUser.id)) {
                    await fetchProfile(currentUser.id);
                }

                if (shouldShowLoading) setLoading(false);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
                setLoading(false);
            } else {
                setUser(currentUser);
                if (currentUser && !profile) {
                    await fetchProfile(currentUser.id);
                }
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        console.log('Executing immediate signOut sequence...');

        // 1. Disparar el cierre en Supabase en segundo plano (sin esperar)
        if (supabase) {
            supabase.auth.signOut().catch(err =>
                console.warn('Silent Supabase signOut error (ignoring):', err)
            );
        }

        // 2. Limpieza inmediata del estado de React
        setProfile(null);
        setUser(null);
        setLoading(false);

        // 3. Limpieza física de datos del navegador
        try {
            localStorage.clear();
            sessionStorage.clear();
            // Limpia específicamente la persistencia de Supabase
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('sb-')) localStorage.removeItem(key);
            });

            // Limpieza de Cookies (mejorada)
            const cookies = document.cookie.split(";");
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i];
                const eqPos = cookie.indexOf("=");
                const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            }
        } catch (e) {
            console.error('Browser storage cleanup error:', e);
        }

        console.log('Local session destroyed, forcing hard redirect...');
        // 4. Redirección dura garantizada a nivel de navegador
        window.location.replace('/admin/login');
    };

    const isAdmin = profile?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAdmin, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
