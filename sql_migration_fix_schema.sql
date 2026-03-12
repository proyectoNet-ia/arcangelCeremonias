-- Migración: Corrección de Schema y RLS para Perfiles
-- Este script soluciona el error "Database error querying schema" y elimina la recursividad en RLS.

-- 1. Asegurar permisos básicos de esquema
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE ON TYPE public.user_role TO anon, authenticated;

-- 2. Corregir función handle_new_user para ser más robusta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role public.user_role;
BEGIN
  -- Intentar obtener el rol del metadata, si falla o es inválido, usar 'editor'
  BEGIN
    assigned_role := (new.raw_user_meta_data->>'role')::public.user_role;
  EXCEPTION WHEN others THEN
    assigned_role := 'editor'::public.user_role;
  END;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    assigned_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Corregir Políticas de RLS para evitar recursión
-- Primero borramos la política problemática
DROP POLICY IF EXISTS "Admins pueden gestionar todo en perfiles" ON public.profiles;
DROP POLICY IF EXISTS "Los perfiles son visibles por usuarios autenticados" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil básico" ON public.profiles;

-- Política de Lectura: Todos los autenticados pueden ver perfiles
CREATE POLICY "profiles_select_policy" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true);

-- Política de Actualización: Los usuarios pueden editar su propio nombre
CREATE POLICY "profiles_update_own_policy" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política para Admins: Usamos auth.jwt() para verificar el rol sin necesidad de consultar tablas protegidas
CREATE POLICY "profiles_admin_all_policy" 
ON public.profiles FOR ALL 
TO authenticated 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Asegurar que RLS esté habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
