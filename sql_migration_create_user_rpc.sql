-- Migración: Función para crear usuarios desde el CMS (Admin Panel)
-- Esta función permite a un administrador crear otros usuarios estableciendo su email, contraseña y perfil inicial.
-- Debe ejecutarse en el SQL Editor de Supabase.

-- 1. Asegurarse de tener pgcrypto habilitado para el hash de contraseñas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Función de ayuda para crear usuarios de forma segura
CREATE OR REPLACE FUNCTION public.create_new_user_admin(
    user_email text,
    user_password text,
    user_full_name text DEFAULT 'Usuario CMS',
    user_role text DEFAULT 'editor'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_user_id uuid;
    role_enum user_role;
BEGIN
    -- Verificar que quien llama es administrador
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'admin' THEN
        RAISE EXCEPTION 'Solo los administradores pueden crear nuevos usuarios.';
    END IF;

    -- Castear el rol al enum user_role
    BEGIN
        role_enum := user_role::user_role;
    EXCEPTION WHEN others THEN
        role_enum := 'editor'::user_role;
    END;

    -- 1. Crear usuario en Auth
    -- Nota: Usamos crypt para generar el hash compatible con el sistema Auth de Supabase
    -- Se asume el uso de bfloat/bcrypt que es la norma en Supabase
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        last_sign_in_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    )
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        user_email,
        crypt(user_password, gen_salt('bf')),
        now(),
        jsonb_build_object('provider', 'email', 'providers', array['email']),
        jsonb_build_object('full_name', user_full_name, 'role', user_role),
        false,
        now(),
        now(),
        now(),
        '',
        '',
        '',
        ''
    )
    RETURNING id INTO new_user_id;

    -- Nota: La tabla public.profiles se llenará automáticamente mediante el trigger `on_auth_user_created`
    -- que ya existe en el sistema (definido en sql_migration_user_roles.sql).

    RETURN new_user_id;

EXCEPTION WHEN unique_violation THEN
    RAISE EXCEPTION 'El correo electrónico ya está registrado en el sistema.';
END;
$$;

-- 3. Otorgar permisos de ejecución solo a usuarios autenticados
-- La validación interna de 'admin' protege contra usos no autorizados.
GRANT EXECUTE ON FUNCTION public.create_new_user_admin(text, text, text, text) TO authenticated;
