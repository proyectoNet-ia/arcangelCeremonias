-- Migración: Implementación de Soft Delete (is_active)
-- Permitir que los editores oculten productos en lugar de eliminarlos físicamente

-- 1. Añadir columna is_active a productos si no existe
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Añadir columna is_active a categorías si no existe
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Actualizar productos existentes para que sean activos por defecto
UPDATE public.products SET is_active = true WHERE is_active IS NULL;
UPDATE public.categories SET is_active = true WHERE is_active IS NULL;

-- 4. (Opcional) Índices para mejorar rendimiento de filtros
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON public.categories(is_active);
