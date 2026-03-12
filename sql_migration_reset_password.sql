-- Migración: Función para restablecer contraseñas desde el CMS (Admin Panel)
-- Esta función permite a un administrador cambiar la contraseña de otro usuario.

CREATE OR REPLACE FUNCTION public.admin_reset_user_password(
    target_user_id uuid,
    new_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar que quien llama es administrador
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'admin' THEN
        RAISE EXCEPTION 'Solo los administradores pueden restablecer contraseñas.';
    END IF;

    -- Actualizar la contraseña en auth.users
    -- Usamos crypt para generar el hash compatible con el sistema Auth de Supabase
    UPDATE auth.users
    SET encrypted_password = crypt(new_password, gen_salt('bf')),
        updated_at = now()
    WHERE id = target_user_id;

    RETURN true;

EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Error al restablecer la contraseña: %', SQLERRM;
END;
$$;

-- Otorgar permisos de ejecución solo a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.admin_reset_user_password(uuid, text) TO authenticated;
