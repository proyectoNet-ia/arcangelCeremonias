/**
 * Optimiza una imagen para el catálogo:
 * - Soporta WebP para máxima compresión.
 * - Diferentes modos: 'cover' (recorta) o 'contain' (ajusta).
 * - Reducción inteligente según el uso.
 */
export interface OptimizationOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'image/webp' | 'image/jpeg';
    fit?: 'cover' | 'contain' | 'none';
}

export const optimizeImage = (file: File, options: OptimizationOptions = {}): Promise<Blob> => {
    const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.8,
        format = 'image/webp',
        fit = 'none'
    } = options;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Si no hay fit, redimensionamos proporcionalmente solo si excede el máximo
                if (fit === 'none') {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                    canvas.width = width;
                    canvas.height = height;
                } else {
                    canvas.width = maxWidth;
                    canvas.height = maxHeight;
                }

                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Could not get canvas context');

                // Fondo blanco para WebP/JPEG
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                if (fit === 'none') {
                    ctx.drawImage(img, 0, 0, width, height);
                } else {
                    const scale = fit === 'cover'
                        ? Math.max(maxWidth / img.width, maxHeight / img.height)
                        : Math.min(maxWidth / img.width, maxHeight / img.height);

                    const drawWidth = img.width * scale;
                    const drawHeight = img.height * scale;
                    const x = (canvas.width - drawWidth) / 2;
                    const y = (canvas.height - drawHeight) / 2;
                    ctx.drawImage(img, x, y, drawWidth, drawHeight);
                }

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            console.log(`[Image Optimization] Original: ${(file.size / 1024).toFixed(1)}KB -> Optimized: ${(blob.size / 1024).toFixed(1)}KB (${format})`);
                            resolve(blob);
                        } else {
                            reject('Canvas toBlob failed');
                        }
                    },
                    format,
                    quality
                );
            };
        };
        reader.onerror = (err) => reject(err);
    });
};
