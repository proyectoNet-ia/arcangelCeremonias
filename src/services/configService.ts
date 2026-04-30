import { supabase } from '../lib/supabase';

export interface SiteConfig {
    id?: string;
    // ── Contacto ──────────────────────────────────────
    company_name: string;
    whatsapp: string;
    phone: string;
    email: string;
    facebook_url: string;
    instagram_url: string;
    address: string;
    google_maps_url: string;
    office_hours?: string;
    // ── Identidad Visual ──────────────────────────────
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    logo_light_url?: string;
    logo_dark_url?: string;
    favicon_url?: string;
    // ── Página Nosotros ───────────────────────────────
    about_title?: string;
    about_subtitle?: string;
    about_quote?: string;
    about_body_1?: string;
    about_body_2?: string;
    about_body_3?: string;
    about_image_url?: string;
    about_stat_1_value?: string;
    about_stat_1_label?: string;
    about_stat_1_desc?: string;
    about_stat_2_value?: string;
    about_stat_2_label?: string;
    about_stat_2_desc?: string;
    about_stat_3_value?: string;
    about_stat_3_label?: string;
    about_stat_3_desc?: string;
    about_stat_4_value?: string;
    about_stat_4_label?: string;
    about_stat_4_desc?: string;
    // ── Banner CTA Home (Mayoreo) ─────────────────────
    cta_banner_title?: string;
    cta_banner_subtitle?: string;
    cta_banner_tag?: string;
    cta_banner_body?: string;
    cta_banner_btn1_label?: string;
    cta_banner_btn2_label?: string;
    cta_banner_bg_color?: string;
    cta_banner_bg_image_url?: string;
    cta_banner_bg_opacity?: number;
    // ── Extras / Archivos ──────────────────────────────
    catalog_pdf_url?: string;
    maintenance_mode?: boolean;
    show_prices?: boolean;
}

export const configService = {
    async getConfig() {
        try {
            const { data, error } = await supabase
                .from('site_config')
                .select('*')
                .eq('id', 'config_1')
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
