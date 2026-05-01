import { supabase } from '../lib/supabase';

export interface HeroSlide {
    id?: string;
    title_1: string;
    title_2: string;
    subtitle: string;
    tag: string;
    bg_url: string;
    bg_mobile_url?: string;
    cta_label: string;
    cta_link: string;
    order_index: number;
    is_active: boolean;
}

export const heroService = {
    async getSlides() {
        const { data, error } = await supabase
            .from('hero_slides')
            .select('*')
            .order('order_index', { ascending: true });

        if (error) throw error;
        return data as HeroSlide[];
    },

    async upsertSlide(slide: Partial<HeroSlide>) {
        const { data, error } = await supabase
            .from('hero_slides')
            .upsert(slide)
            .select()
            .single();

        if (error) throw error;
        return data as HeroSlide;
    },

    async deleteSlide(id: string) {
        const { error } = await supabase
            .from('hero_slides')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
