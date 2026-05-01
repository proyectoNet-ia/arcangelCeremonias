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
     * Registra una visita a la página
     */
    async trackPageView(path: string) {
        if (!supabase) return;
        // No trackear en localhost para no ensuciar datos
        if (window.location.hostname === 'localhost') return;

        try {
            const { error } = await supabase
                .from('page_views')
                .insert([
                    {
                        path: path || window.location.pathname,
                        user_agent: navigator.userAgent,
                        referrer: document.referrer || 'direct'
                    }
                ]);

            if (error) throw error;
        } catch (error) {
            // Silently fail to not disturb user experience
            console.warn('PageView tracking error:', error);
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
    },

    /**
     * Obtiene estadísticas para el Dashboard
     */
    async getDashboardStats() {
        if (!supabase) return { pageViews: 0, uniqueVisitors: 0, whatsappClicks: 0 };

        try {
            // 1. WhatsApp Clicks
            const { count: whatsappClicks } = await supabase
                .from('whatsapp_clicks')
                .select('*', { count: 'exact', head: true });

            // 2. Total Page Views
            const { count: pageViews } = await supabase
                .from('page_views')
                .select('*', { count: 'exact', head: true });

            // 3. Unique Visitors (approximated by distinct IPs or sessions, but without dedicated column we'll just show total for now or use count distinct)
            // Note: Simple Supabase query doesn't do "COUNT DISTINCT" easily without RPC, but we can approximate.

            return {
                pageViews: pageViews || 0,
                whatsappClicks: whatsappClicks || 0,
                conversionRate: pageViews ? ((whatsappClicks || 0) / pageViews * 100).toFixed(1) : 0
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            return { pageViews: 0, whatsappClicks: 0, conversionRate: 0 };
        }
    },

    /**
     * Obtiene los últimos clics de WhatsApp con info de producto si aplica
     */
    async getRecentWhatsAppClicks(limit = 10) {
        if (!supabase) return [];

        try {
            const { data, error } = await supabase
                .from('whatsapp_clicks')
                .select(`
                    *,
                    products (
                        name,
                        model_code,
                        main_image
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching recent WhatsApp clicks:', error);
            return [];
        }
    },

    /**
     * Obtiene los productos más populares (con más clics)
     */
    async getTopProducts(limit = 3) {
        if (!supabase) return [];

        try {
            // Esta es una consulta avanzada que requiere un rpc de supabase o un filtrado manual si no es pesada
            // Para simplicidad en este MVP, traemos los clics y agrupamos
            const { data, error } = await supabase
                .from('whatsapp_clicks')
                .select('product_id, products(name, model_code, main_image)')
                .not('product_id', 'is', null);

            if (error) throw error;

            // Agrupación manual (eficiente para volúmenes moderados)
            const stats: Record<string, any> = {};
            data.forEach((click: any) => {
                if (!click.product_id) return;
                if (!stats[click.product_id]) {
                    stats[click.product_id] = {
                        ...click.products,
                        clicks: 0
                    };
                }
                stats[click.product_id].clicks++;
            });

            return Object.values(stats)
                .sort((a: any, b: any) => b.clicks - a.clicks)
                .slice(0, limit);
        } catch (error) {
            console.error('Error getting top products:', error);
            return [];
        }
    }
};
