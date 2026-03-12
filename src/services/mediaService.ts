import { supabase } from '../lib/supabase';
import { optimizeImage } from '../lib/imageOptimization';

// ── Seguridad: Formatos Permitidos ────────────────────────────────
export const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
export const ALLOWED_DOC_FORMATS = ['application/pdf'];
export const ALL_ALLOWED_FORMATS = [...ALLOWED_IMAGE_FORMATS, ...ALLOWED_DOC_FORMATS];
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // Aumentado a 20MB para fotos de celulares modernos

export interface MediaFile {
    name: string;
    id: string;
    updated_at: string;
    created_at: string;
    last_accessed_at: string;
    metadata: {
        size: number;
        mimetype: string;
        cacheControl: string;
    };
    url: string;
    folder: string;
}

export const mediaService = {
    async listFiles(folder: string = '') {
        const { data, error } = await supabase.storage
            .from('catalog')
            .list(folder, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) throw error;

        return data.map(file => ({
            ...file,
            url: supabase.storage.from('catalog').getPublicUrl(`${folder ? folder + '/' : ''}${file.name}`).data.publicUrl,
            folder
        })) as MediaFile[];
    },

    async deleteFile(path: string) {
        const { data, error } = await supabase.storage
            .from('catalog')
            .remove([path]);

        if (error) throw error;

        // Si data está vacío, significa que el archivo no existía en esa ruta o no tenemos permisos
        if (!data || data.length === 0) {
            throw new Error('No se pudo encontrar el archivo en el servidor. Verifique los permisos o si ya fue eliminado.');
        }

        return true;
    },

    async getAllMedia() {
        const folders = ['products', 'hero', 'branding', 'files'];
        const allFiles: MediaFile[] = [];

        for (const folder of folders) {
            try {
                const files = await this.listFiles(folder);
                // Filter out placeholder files or empty listings
                allFiles.push(...files.filter(f => !f.name.startsWith('.')).map(f => ({ ...f, folder })));
            } catch (err) {
                console.error(`Error listing folder ${folder}:`, err);
            }
        }

        return allFiles;
    },

    async uploadFile(file: File, folder: string) {
        // 1. Validar archivo
        this.validateFile(file);

        let fileToUpload = file;

        // 2. Optimización automática por carpeta
        if (file.type.startsWith('image/') && !file.type.includes('svg')) {
            try {
                let options = {};
                if (folder === 'products') {
                    // Productos: Formato vertical estándar Arcángel
                    options = { maxWidth: 800, maxHeight: 1100, fit: 'cover', format: 'image/webp' };
                } else if (folder === 'hero') {
                    // Banners: Alta resolución horizontal
                    options = { maxWidth: 1920, maxHeight: 1080, fit: 'none', format: 'image/webp', quality: 0.85 };
                } else {
                    // Otros (Branding, etc): Optimizar sin estirar
                    options = { maxWidth: 1200, maxHeight: 1200, fit: 'none', format: 'image/webp' };
                }

                const optimizedBlob = await optimizeImage(file, options);
                const newExtension = 'webp';
                const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'image';
                fileToUpload = new File([optimizedBlob], `${baseName}.${newExtension}`, { type: 'image/webp' });
            } catch (err) {
                console.warn('Auto-optimization failed, uploading original', err);
            }
        }

        // 3. Generar nombre único
        const fileExt = fileToUpload.name.split('.').pop()?.toLowerCase() ?? 'bin';
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        // 4. Subir a Supabase
        const { error: uploadError } = await supabase.storage
            .from('catalog')
            .upload(filePath, fileToUpload, {
                cacheControl: '3600',
                upsert: false,
                contentType: fileToUpload.type || 'application/octet-stream',
            });

        if (uploadError) throw uploadError;

        // 5. Retornar URL pública
        const { data } = supabase.storage
            .from('catalog')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    validateFile(file: File) {
        if (!ALL_ALLOWED_FORMATS.includes(file.type)) {
            throw new Error(`Formato no permitido: ${file.type}. Use JPG, PNG, WEBP, GIF o PDF.`);
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`Archivo demasiado grande: ${(file.size / (1024 * 1024)).toFixed(2)}MB. El límite es 20MB.`);
        }
        return true;
    }
};
