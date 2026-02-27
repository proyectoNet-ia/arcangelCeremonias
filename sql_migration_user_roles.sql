-- Migración: Sistema de Perfiles y Roles
-- Ejecutar en el SQL Editor de Supabase

-- 1. Crear el tipo enumerado para los roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'editor');
    END IF;
END$$;

-- 2. Crear la tabla de perfiles
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'editor' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Seguridad
-- Todos los autenticados pueden ver los perfiles (para saber quién editó qué)
CREATE POLICY "Los perfiles son visibles por usuarios autenticados" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

-- Solo el propio usuario puede actualizar su nombre (pero no su rol)
CREATE POLICY "Usuarios pueden actualizar su propio perfil básico" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Solo los Admins pueden gestionar roles y otros perfiles completos
-- Nota: Esta política usa una función recursiva si no se tiene cuidado. 
-- Usamos una verificación basada en metadata si es posible, o una subconsulta simple.
CREATE POLICY "Admins pueden gestionar todo en perfiles" 
ON profiles FOR ALL 
TO authenticated 
USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 5. Función y Trigger para creación automática de perfil al registrarse en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'editor')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
