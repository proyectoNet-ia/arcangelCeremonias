-- Migración: Crear tabla de mensajes de contacto
-- Ejecutar en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    email_sent BOOLEAN DEFAULT false
);

-- Habilitar RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Permitir inserción pública (para que los clientes envíen mensajes)
CREATE POLICY "Permitir inserción pública de mensajes" 
ON contact_messages FOR INSERT 
WITH CHECK (true);

-- Permitir lectura solo para usuarios autenticados (admin)
CREATE POLICY "Permitir lectura solo a admins" 
ON contact_messages FOR SELECT 
TO authenticated 
USING (true);

-- Permitir actualización solo para usuarios autenticados (marcar como leído)
CREATE POLICY "Permitir actualización solo a admins" 
ON contact_messages FOR UPDATE 
TO authenticated 
USING (true);

-- Permitir eliminación solo a admins
CREATE POLICY "Permitir navegación solo a admins" 
ON contact_messages FOR DELETE 
TO authenticated 
USING (true);
