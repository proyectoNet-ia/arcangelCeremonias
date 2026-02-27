-- Migración: Añadir campos de personalización visual de CTA y Catálogo PDF a site_config
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS cta_banner_bg_color     TEXT DEFAULT '#1B1411',
  ADD COLUMN IF NOT EXISTS cta_banner_bg_image_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS cta_banner_bg_opacity   NUMERIC DEFAULT 0.85,
  ADD COLUMN IF NOT EXISTS catalog_pdf_url         TEXT DEFAULT '';

-- Actualizar bucket catalog para permitir archivos PDF
UPDATE storage.buckets 
SET allowed_mime_types = array_append(allowed_mime_types, 'application/pdf')
WHERE id = 'catalog' 
  AND NOT ('application/pdf' = ANY (allowed_mime_types));

-- Verificar que se crearon correctamente
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'site_config'
  AND column_name IN ('cta_banner_bg_color', 'cta_banner_bg_image_url', 'catalog_pdf_url');
