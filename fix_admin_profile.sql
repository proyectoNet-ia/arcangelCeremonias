-- REPARACIÓN DE PERFILES Y PERMISOS
-- Ejecutar este bloque de código completo en el SQL Editor de Supabase

-- 1. Intentar sincronizar usuarios de Auth con la tabla de Perfiles
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    u.id, 
    u.email, 
    COALESCE(u.raw_user_meta_data->>'full_name', 'Administrador'), 
    CASE 
        WHEN u.email = 'admin@ceremoniasarcangel.com' THEN 'admin'::user_role
        ELSE COALESCE((u.raw_user_meta_data->>'role')::user_role, 'editor')
    END
FROM auth.users u
WHERE u.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 2. Asegurarse de que el administrador principal sea efectivamente admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@ceremoniasarcangel.com';

-- 3. Si existe un perfil con el correo pero ID diferente (mismatch), corregirlo
-- Nota: Esto asume que el usuario se recreó pero el perfil quedó huérfano
DO $$
DECLARE
    real_auth_id UUID;
BEGIN
    SELECT id INTO real_auth_id FROM auth.users WHERE email = 'admin@ceremoniasarcangel.com' LIMIT 1;
    
    IF real_auth_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = real_auth_id) THEN
        -- Borrar perfil con ID antiguo si existe para este correo
        DELETE FROM public.profiles WHERE email = 'admin@ceremoniasarcangel.com' AND id != real_auth_id;
        -- Insertar el perfil correcto
        INSERT INTO public.profiles (id, email, full_name, role)
        VALUES (real_auth_id, 'admin@ceremoniasarcangel.com', 'Administrador Principal', 'admin');
    END IF;
END $$;

-- 4. Reforzar RLS para lectura (Debe permitir a todos los autenticados leer perfiles)
DROP POLICY IF EXISTS "Los perfiles son visibles por usuarios autenticados" ON profiles;
CREATE POLICY "Los perfiles son visibles por usuarios autenticados" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);
