import { supabase } from '../lib/supabase';
import { Product, Category } from '../types/product';

export const productService = {
    async getProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(*)');

        if (error) throw error;
        return data as (Product & { categories: Category })[];
    },

    async getCategories() {
        const { data, error } = await supabase
            .from('categories')
            .select('*');

        if (error) throw error;
        return data as Category[];
    },

    async getProductBySlug(slug: string) {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(*)')
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return data as (Product & { categories: Category });
    }
};
