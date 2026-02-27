import { supabase } from '../lib/supabase';

export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    role: 'admin' | 'editor';
    created_at: string;
}

export const userService = {
    /**
     * Obtiene todos los perfiles registrados
     */
    async getProfiles() {
        if (!supabase) return [];

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Profile[];
        } catch (error) {
            console.error('Error fetching profiles:', error);
            return [];
        }
    },

    /**
     * Actualiza el rol de un usuario
     */
    async updateRole(userId: string, role: 'admin' | 'editor') {
        if (!supabase) return false;

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role })
                .eq('id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error updating role:', error);
            return false;
        }
    },

    /**
     * Elimina un usuario (desde la tabla profiles, el usuario en auth debe borrarse manualmente o vía API de admin)
     * Nota: En Supabase, borrar en auth.users requiere el service_role key o llamar a una función RPC de confianza.
     * Aquí solo lo quitamos de la vista si es necesario, pero lo ideal es borrar el auth.user.
     */
    async deleteProfile(userId: string) {
        if (!supabase) return false;

        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .eq('id', userId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting profile:', error);
            return false;
        }
    }
};
