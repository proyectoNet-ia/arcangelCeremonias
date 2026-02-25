-- ============================================================
-- MIGRACIÓN: Crear bucket "catalog" en Supabase Storage
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Crear el bucket (público = las URLs de imágenes son accesibles sin auth)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'catalog',
    'catalog',
    true,              -- público: las imágenes se pueden ver sin autenticación
    5242880,           -- 5 MB máximo por archivo
    ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;  -- no falla si ya existe

-- 2. Política: cualquiera puede LEER (SELECT) los archivos del bucket
CREATE POLICY "Lectura pública catalog"
ON storage.objects FOR SELECT
USING (bucket_id = 'catalog');

-- 3. Política: usuarios autenticados pueden SUBIR (INSERT) archivos
CREATE POLICY "Upload autenticado catalog"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'catalog');

-- 4. Política: usuarios autenticados pueden ACTUALIZAR archivos
CREATE POLICY "Update autenticado catalog"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'catalog');

-- 5. Política: usuarios autenticados pueden ELIMINAR archivos
CREATE POLICY "Delete autenticado catalog"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'catalog');

-- ============================================================
-- NOTA: Si el admin no usa auth (acceso anónimo), reemplaza
-- TO authenticated  →  TO anon
-- ============================================================
