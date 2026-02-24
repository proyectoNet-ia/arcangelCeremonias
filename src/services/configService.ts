import { supabase } from '../lib/supabase';

export interface SiteConfig {
    id?: string;
    company_name: string;
    whatsapp: string;
    phone: string;
    email: string;
    facebook_url: string;
    instagram_url: string;
    address: string;
    google_maps_url: string;
    office_hours?: string;
}

export const configService = {
    async getConfig() {
        try {
            const { data, error } = await supabase
                .from('site_config')
                .select('*')
                .maybeSingle();

            if (error) {
                console.error('Error fetching config:', error);
                return null;
            }
            return data as SiteConfig | null;
        } catch (err) {
            console.error('Config Service Error:', err);
            return null;
        }
    },

    async updateConfig(config: Partial<SiteConfig>) {
        // Extraemos el id para asegurar que no se sobrescriba el ID fijo 'config_1'
        const { id, ...configData } = config;

        const { data, error } = await supabase
            .from('site_config')
            .upsert({ id: 'config_1', ...configData })
            .select()
            .single();

        if (error) {
            console.error('Update Config Error details:', error);
            throw error;
        }
        return data as SiteConfig;
    }
};
