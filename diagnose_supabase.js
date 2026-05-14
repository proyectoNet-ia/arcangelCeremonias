import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uijtnyffwfzbpclxiyzs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpanRueWZmd2Z6YnBjbHhpeXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjUwMzQsImV4cCI6MjA4NzQ0MTAzNH0.xkPRIWMa9klzPhZmqC_7bvc-kWegGqmSQ6n6aZahDYE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnose() {
    console.log('--- DIAGNÓSTICO DE SUPABASE ---');

    // 1. Probar conexión básica
    const { data: catData, error: catError } = await supabase.from('categories').select('count', { count: 'exact', head: true });
    if (catError) {
        console.error('❌ Error al conectar o tabla categories no encontrada:', catError.message);
    } else {
        console.log('✅ Conexión exitosa. Tabla categories accesible.');
    }

    // 2. Probar tabla profiles
    const { data: profData, error: profError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (profError) {
        console.error('❌ Error en tabla profiles (¿Ejecutaste las migraciones SQL?):', profError.message);
    } else {
        console.log('✅ Tabla profiles existe y es accesible.');
    }

    // 3. Verificar si hay usuarios
    const { data: users } = await supabase.from('profiles').select('email, role');
    console.log('Usuarios en profiles:', users || []);
}

diagnose();
