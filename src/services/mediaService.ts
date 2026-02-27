import { supabase } from '../lib/supabase';

// ── Seguridad: Formatos Permitidos ────────────────────────────────
export const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
export const ALLOWED_DOC_FORMATS = ['application/pdf'];
export const ALL_ALLOWED_FORMATS = [...ALLOWED_IMAGE_FORMATS, ...ALLOWED_DOC_FORMATS];
export const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

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
        const { error } = await supabase.storage
            .from('catalog')
            .remove([path]);

        if (error) throw error;
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

    validateFile(file: File) {
        if (!ALL_ALLOWED_FORMATS.includes(file.type)) {
            throw new Error(`Formato no permitido: ${file.type}. Use JPG, PNG, WEBP, GIF o PDF.`);
        }
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`Archivo demasiado grande: ${(file.size / (1024 * 1024)).toFixed(2)}MB. El límite es 15MB.`);
        }
        return true;
    }
};
