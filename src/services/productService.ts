import { supabase } from '../lib/supabase';
import { Product, Category } from '../types/product';
import { mediaService, MAX_FILE_SIZE } from './mediaService';

export const productService = {
    async getProducts(onlyActive = false) {
        let query = supabase
            .from('products')
            .select('*, categories(*)');

        if (onlyActive) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        return data as (Product & { categories: Category })[];
    },

    async getCategories(onlyActive = false) {
        let query = supabase
            .from('categories')
            .select('*');

        if (onlyActive) {
            query = query.eq('is_active', true);
        }

        const { data, error } = await query;

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

    async upsertCategory(category: Partial<Category>) {
        const { data, error } = await supabase
            .from('categories')
            .upsert(category)
            .select()
            .single();

        if (error) throw error;
        return data as Category;
    },

    async deleteCategory(id: string) {
        // Primero verificar si hay productos vinculados
        const { count, error: checkError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', id);

        if (checkError) throw checkError;
        if (count && count > 0) {
            throw new Error(`No se puede eliminar: Esta categoría tiene ${count} productos vinculados.`);
        }

        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    async uploadImage(file: File, path: string) {
        return mediaService.uploadFile(file, path);
    },

    async uploadFile(file: File, _bucket: string, path: string) {
        return mediaService.uploadFile(file, path);
    }
};
