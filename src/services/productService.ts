import { supabase } from '../lib/supabase';
import { Product, Category } from '../types/product';

export const productService = {
    async getProducts() {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(*)')
            .order('created_at', { ascending: false });

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
    },

    async upsertProduct(product: Partial<Product>) {
        const { data, error } = await supabase
            .from('products')
            .upsert(product)
            .select()
            .single();

        if (error) throw error;
        return data as Product;
    },

    async deleteProduct(id: string) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async uploadImage(file: File, path: string) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('catalog')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('catalog')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
};
