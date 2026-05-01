-- Migración: Crear tabla para seguimiento de clics de WhatsApp
-- Ejecutar en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS whatsapp_clicks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    page_url TEXT, -- Desde qué página hicieron clic (Home, Catálogo, Producto, etc)
    product_id UUID REFERENCES products(id) ON DELETE SET NULL, -- Si hicieron clic desde un producto específico
    user_agent TEXT -- Información básica del navegador (opcional)
);

-- Habilitar RLS
ALTER TABLE whatsapp_clicks ENABLE ROW LEVEL SECURITY;

-- Permitir inserción desde el cliente
CREATE POLICY "Permitir registro de clics público" 
ON whatsapp_clicks FOR INSERT 
WITH CHECK (true);

-- Permitir lectura solo para admins
CREATE POLICY "Permitir lectura de clics solo a admins" 
ON whatsapp_clicks FOR SELECT 
TO authenticated 
USING (true);
