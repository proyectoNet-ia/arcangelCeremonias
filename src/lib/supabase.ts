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

export const supabase = isUrlValid(supabaseUrl || '')
    ? createClient(supabaseUrl, supabaseAnonKey || '')
    : (null as any);
