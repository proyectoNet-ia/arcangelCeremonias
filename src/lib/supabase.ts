import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isUrlValid = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

if (!supabaseUrl || !supabaseAnonKey || !isUrlValid(supabaseUrl)) {
    console.error('ERROR: Credenciales de Supabase inválidas o faltantes en el archivo .env');
}

// Implementación de almacenamiento personalizado sin el sistema de Locks del navegador
const customStorage = {
    getItem: (key: string) => {
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    },
    setItem: (key: string, value: string) => {
        try {
            window.localStorage.setItem(key, value);
        } catch (e) {
            console.warn('Storage set error:', e);
        }
    },
    removeItem: (key: string) => {
        try {
            window.localStorage.removeItem(key);
        } catch { }
    }
};


export const supabase = isUrlValid(supabaseUrl || '')
    ? createClient(supabaseUrl, supabaseAnonKey || '', {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            storageKey: 'arcangel-session-v5', // Llave nueva permite ignorar "Locks" antiguos bloqueados en el navegador
            storage: customStorage,
            lock: async (name: string, _acquireTimeout: number, callback: () => Promise<any>) => {
                console.log('Supabase Lock Bypass (v2026 Compatible):', name);
                return await callback();
            },
        },
        global: {
            fetch: (input: RequestInfo | URL, init?: RequestInit) => fetch(input, init).catch(err => {
                console.error('Network error during Supabase fetch:', err);
                throw err;
            })
        }
    })
    : (null as any);
