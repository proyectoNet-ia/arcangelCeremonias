-- Migración: Añadir columnas de identidad visual y logos a site_config
-- Ejecutar en el SQL Editor de Supabase

ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS primary_color   TEXT DEFAULT '#3E2723',
  ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#C5A059',
  ADD COLUMN IF NOT EXISTS accent_color    TEXT DEFAULT '#FDF8F1',
  ADD COLUMN IF NOT EXISTS logo_light_url  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS logo_dark_url   TEXT DEFAULT '';

-- Verificar que se crearon correctamente
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'site_config'
ORDER BY ordinal_position;
