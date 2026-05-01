-- Migración: Función para eliminar usuarios desde el CMS (Admin Panel)
-- Esta función permite a un administrador eliminar a otro usuario tanto de auth.users como de public.profiles.

CREATE OR REPLACE FUNCTION public.delete_user_admin(
    target_user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- 1. Verificar que quien llama es administrador
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'admin' THEN
        RAISE EXCEPTION 'Solo los administradores pueden eliminar usuarios.';
    END IF;

    -- 2. Impedir que un admin se elimine a sí mismo mediante esta función
    -- (Aunque el frontend ya lo previene, es una medida de seguridad extra)
    IF target_user_id = auth.uid() THEN
        RAISE EXCEPTION 'No puedes eliminar tu propia cuenta desde este panel.';
    END IF;

    -- 3. Eliminar de auth.users
    -- Al estar vinculada la tabla public.profiles con ON DELETE CASCADE, 
    -- el perfil se borrará automáticamente.
    DELETE FROM auth.users WHERE id = target_user_id;

    RETURN true;

EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Error al eliminar el usuario: %', SQLERRM;
END;
$$;

-- Otorgar permisos de ejecución solo a usuarios autenticados
GRANT EXECUTE ON FUNCTION public.delete_user_admin(uuid) TO authenticated;
