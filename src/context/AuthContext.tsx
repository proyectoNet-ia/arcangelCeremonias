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
                console.warn('Auth initialization timed out');
            }, 8000);

            try {
                console.log('Initializing AuthContext...');
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Session error:', sessionError);
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
                console.error('Initialization crash:', err);
            } finally {
                clearTimeout(timeoutId);
                console.log('Initialization complete, setting loading to false.');
                setLoading(false);
            }
        };

        initialize();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                await fetchProfile(currentUser.id);
            } else {
                setProfile(null);
            }
            // Ensure loading is false even after auth changes
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
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
