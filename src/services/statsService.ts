import { supabase } from '../lib/supabase';

export const statsService = {
    /**
     * Registra un clic en el botón de WhatsApp
     */
    async trackWhatsAppClick(pageUrl?: string, productId?: string) {
        if (!supabase) return;

        try {
            const { error } = await supabase
                .from('whatsapp_clicks')
                .insert([
                    {
                        page_url: pageUrl || window.location.href,
                        product_id: productId || null,
                        user_agent: navigator.userAgent
                    }
                ]);

            if (error) throw error;
        } catch (error) {
            console.error('Error tracking WhatsApp click:', error);
        }
    },

    /**
     * Obtiene el total de clics registrados
     */
    async getWhatsAppClicksCount() {
        if (!supabase) return 0;

        try {
            const { count, error } = await supabase
                .from('whatsapp_clicks')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('Error getting WhatsApp clicks count:', error);
            return 0;
        }
    }
};
