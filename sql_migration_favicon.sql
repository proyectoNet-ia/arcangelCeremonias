-- Migración: Añadir columna favicon_url a site_config
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS favicon_url TEXT DEFAULT '';

-- Verificar que se creó correctamente
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'site_config'
  AND column_name = 'favicon_url';
