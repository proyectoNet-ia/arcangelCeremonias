/**
 * Optimiza una imagen para el catálogo:
 * - Redimensiona a un aspecto vertical (800x1100 px).
 * - Aplica compresión JPEG al 80%.
 * - Normaliza el fondo a blanco si hay transparencias.
 */
export const optimizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // Target: Vertical Aspect Ratio (2:3 or 3:4) - Arcángel Standard
                const targetWidth = 800;
                const targetHeight = 1100;

                let width = img.width;
                let height = img.height;

                // Calculate cropping/scaling for vertical format
                const scale = Math.max(targetWidth / width, targetHeight / height);
                const drawWidth = width * scale;
                const drawHeight = height * scale;
                const x = (targetWidth - drawWidth) / 2;
                const y = (targetHeight - drawHeight) / 2;

                canvas.width = targetWidth;
                canvas.height = targetHeight;

                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Could not get canvas context');

                // Fondo blanco para imágenes con transparencia (como PNG) convertido a JPEG
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, targetWidth, targetHeight);
                ctx.drawImage(img, x, y, drawWidth, drawHeight);

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject('Canvas toBlob failed');
                    },
                    'image/jpeg',
                    0.8 // 80% calidad (balance ideal peso/calidad)
                );
            };
        };
        reader.onerror = (err) => reject(err);
    });
};
