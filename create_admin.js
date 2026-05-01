import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer variables de entorno del archivo .env
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const getEnvVar = (name) => {
    const match = envContent.match(new RegExp(`^${name}=(.*)$`, 'm'));
    return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Error: No se encontraron las variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el archivo .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
    const email = process.argv[2];
    const password = process.argv[3];
    const fullName = process.argv[4] || 'Admin Local';

    if (!email || !password) {
        console.log('Uso: node create_admin.js <email> <password> ["Nombre Completo"]');
        process.exit(1);
    }

    console.log(`Intentando registrar a ${email}...`);

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                role: 'admin'
            }
        }
    });

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('\n¡Éxito! Usuario registrado.');
        console.log('ID:', data.user?.id);
        console.log('\nIMPORTANTE: Si no tienes confirmación de correo desactivada, DEBES confirmarlo.');
        console.log('Para forzar el rol sin confirmar, usa este SQL:');
        console.log(`UPDATE profiles SET role = 'admin' WHERE email = '${email}';`);
    }
}

createAdmin();
