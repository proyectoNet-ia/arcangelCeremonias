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
        const fileExt = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
        const filePath = `${path}/${fileName}`;

        // ── Asegurar que el bucket existe (lo crea si no existe) ──────────
        const { data: buckets } = await supabase.storage.listBuckets();
        const exists = buckets?.some(b => b.name === 'catalog');
        if (!exists) {
            await supabase.storage.createBucket('catalog', {
                public: true,
                fileSizeLimit: 5 * 1024 * 1024, // 5 MB
                allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
            });
        }

        const { error: uploadError } = await supabase.storage
            .from('catalog')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type || 'image/jpeg',
            });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('catalog')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
};
