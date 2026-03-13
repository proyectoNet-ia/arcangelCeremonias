import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Profile {
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

    // Use Refs to avoid stale closures in event listeners
    const profileRef = React.useRef<Profile | null>(null);
    const userRef = React.useRef<User | null>(null);

    // Sync refs with state
    useEffect(() => { profileRef.current = profile; }, [profile]);
    useEffect(() => { userRef.current = user; }, [user]);

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
            setLoading(false);
            return;
        }

        const handleAuthEvent = async (event: string, session: any) => {
            console.log(`[Auth Event] ${event}`, session?.user?.id);
            const currentUser = session?.user ?? null;

            if (event === 'SIGNED_OUT') {
                setUser(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            setUser(currentUser);
            
            if (currentUser) {
                // Use profileRef to check if we really need to fetch
                const needsProfileFetch = !profileRef.current || profileRef.current.id !== currentUser.id;
                
                if (needsProfileFetch) {
                    // Only show loading for the very first sign in if we didn't have a user before
                    const shouldShowLoading = event === 'SIGNED_IN' && !userRef.current;
                    if (shouldShowLoading) setLoading(true);
                    
                    await fetchProfile(currentUser.id);
                    
                    if (shouldShowLoading) setLoading(false);
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    await handleAuthEvent('INITIAL', session);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error('Auth Init Error:', err);
                setLoading(false);
            }
        };

        initAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            handleAuthEvent(event, session);
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
