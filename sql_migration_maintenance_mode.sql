-- Migración: Añadir Modo Mantenimiento a site_config
-- Ejecutar este comando en el SQL Editor de Supabase para activar la funcionalidad

ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT TRUE;

-- Verificación final
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'site_config' AND column_name = 'maintenance_mode';
