import { mediaService } from './mediaService';
import { productService } from './productService';
import { heroService } from './heroService';
import { configService } from './configService';

export const cleanupService = {
    async findUnusedMedia() {
        // 1. Obtener todos los archivos de la galería (Storage)
        const allMedia = await mediaService.getAllMedia();
        
        // 2. Obtener todos los usos de imágenes en la base de datos
        const [products, categories, slides, config] = await Promise.all([
            productService.getProducts(),
            productService.getCategories(),
            heroService.getSlides(),
            configService.getConfig()
        ]);

        const usedUrls = new Set<string>();

        // --- Recolectar URLs de Productos ---
        products.forEach(p => {
            if (p.main_image) usedUrls.add(p.main_image);
            if (p.gallery && Array.isArray(p.gallery)) {
                p.gallery.forEach(img => usedUrls.add(img));
            }
        });

        // --- Recolectar URLs de Categorías ---
        categories.forEach(c => {
            if (c.image_url) usedUrls.add(c.image_url);
            if (c.icon_url) usedUrls.add(c.icon_url);
            if (c.size_guide_url) usedUrls.add(c.size_guide_url);
        });

        // --- Recolectar URLs de Hero Slides ---
        slides.forEach(s => {
            if (s.bg_url) usedUrls.add(s.bg_url);
            if (s.bg_mobile_url) usedUrls.add(s.bg_mobile_url);
        });

        // --- Recolectar URLs de Configuración del Sitio ---
        if (config) {
            Object.values(config).forEach(val => {
                if (typeof val === 'string' && (val.includes('supabase') || val.includes('storage'))) {
                    usedUrls.add(val);
                }
            });
        }

        // 3. Cruzar datos: ¿Cuáles archivos del Storage NO están en usedUrls?
        const unused = allMedia.filter(media => {
            // Normalizamos las URLs para la comparación por si acaso (aunque Supabase suele ser consistente)
            const cleanUrl = media.url.split('?')[0]; // Eliminar query params si los hay
            
            // Verificamos si la URL del medio está en el set de usadas
            // Usamos .some porque las URLs en la DB pueden tener params o ligeras variaciones
            return !Array.from(usedUrls).some(used => used.includes(media.name));
        });

        return unused;
    }
};
