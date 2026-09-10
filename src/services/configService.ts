import { supabase } from '../lib/supabase';
import { EnsamblexColor, DEFAULT_OFFICIAL_COLORS } from '../constants/ensamblexColors';

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
    footer_logos_url?: string;
    maintenance_mode?: boolean;
    show_prices?: boolean;
    // ── Colores Oficiales Ensamblex ERP ───────────────
    ensamblex_colors?: EnsamblexColor[];
}

export const configService = {
    async getConfig(): Promise<SiteConfig | null> {
        try {
            const { data, error } = await supabase
                .from('site_config')
                .select('*')
                .eq('id', 'config_1')
                .maybeSingle();

            if (error) {
                console.error('Error fetching config:', error);
            }

            let loadedColors: EnsamblexColor[] = DEFAULT_OFFICIAL_COLORS;
            try {
                if (data && (data as any).ensamblex_colors && Array.isArray((data as any).ensamblex_colors)) {
                    loadedColors = (data as any).ensamblex_colors;
                } else {
                    const localSaved = localStorage.getItem('arcangel_ensamblex_colors');
                    if (localSaved) {
                        loadedColors = JSON.parse(localSaved);
                    }
                }
            } catch (err) {
                console.warn('Error reading ensamblex_colors:', err);
            }

            if (!data) {
                return {
                    company_name: 'Arcángel Ceremonias',
                    whatsapp: '523521681197',
                    phone: '3521681197',
                    email: '',
                    facebook_url: '',
                    instagram_url: '',
                    address: '',
                    google_maps_url: '',
                    ensamblex_colors: loadedColors
                } as SiteConfig;
            }

            return {
                ...(data as SiteConfig),
                ensamblex_colors: loadedColors
            };
        } catch (err) {
            console.error('Config Service Error:', err);
            return null;
        }
    },

    async updateConfig(config: Partial<SiteConfig>): Promise<SiteConfig> {
        const { id, ...configData } = config;

        // Persistir siempre en localStorage para disponibilidad inmediata y offline
        if (configData.ensamblex_colors) {
            try {
                localStorage.setItem('arcangel_ensamblex_colors', JSON.stringify(configData.ensamblex_colors));
            } catch (e) {
                console.warn('Error saving to localStorage:', e);
            }
        }

        try {
            const { data, error } = await supabase
                .from('site_config')
                .upsert({ id: 'config_1', ...configData })
                .select()
                .single();

            if (error) {
                // Si la columna ensamblex_colors no existe aún en la tabla, reintentar sin ella
                if (error.message && error.message.includes('ensamblex_colors')) {
                    const { ensamblex_colors, ...cleanData } = configData;
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('site_config')
                        .upsert({ id: 'config_1', ...cleanData })
                        .select()
                        .single();

                    if (fallbackError) throw fallbackError;
                    return {
                        ...(fallbackData as SiteConfig),
                        ensamblex_colors: configData.ensamblex_colors || DEFAULT_OFFICIAL_COLORS
                    };
                }
                throw error;
            }
            return data as SiteConfig;
        } catch (error) {
            console.error('Update Config Error details:', error);
            throw error;
        }
    }
};
