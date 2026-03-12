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
     * Elimina un usuario (tanto de auth.users como de public.profiles)
     */
    async deleteProfile(userId: string) {
        if (!supabase) return false;

        try {
            const { data, error } = await supabase.rpc('delete_user_admin', {
                target_user_id: userId
            });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error deleting profile:', error);
            return false;
        }
    },

    /**
     * Crea un nuevo usuario directamente desde el CMS llamando al RPC admin_create_user
     */
    async createUser(email: string, password: string, fullName: string, role: string) {
        if (!supabase) return false;

        try {
            const { data, error } = await supabase.rpc('create_new_user_admin', {
                user_email: email,
                user_password: password,
                user_full_name: fullName,
                user_role: role
            });

            if (error) throw error;
            return true;
        } catch (error: any) {
            console.error('Error creating user:', error);
            throw new Error(error.message || 'Error al crear usuario');
        }
    },

    /**
     * Restablece la contraseña de un usuario
     */
    async resetPassword(userId: string, newPassword: string) {
        if (!supabase) return false;

        try {
            const { data, error } = await supabase.rpc('admin_reset_user_password', {
                target_user_id: userId,
                new_password: newPassword
            });

            if (error) throw error;
            return true;
        } catch (error: any) {
            console.error('Error resetting password:', error);
            throw new Error(error.message || 'Error al restablecer contraseña');
        }
    }
};
