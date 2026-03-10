const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

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

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('--- Creador de Usuario Administrador (Arcángel Ceremonias) ---');

rl.question('Introduce el Email para el admin: ', (email) => {
    rl.question('Introduce la Contraseña (mínimo 6 caracteres): ', (password) => {
        rl.question('Introduce el Nombre Completo: ', async (fullName) => {

            console.log('\nRegistrando usuario...');

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
                console.error('Error al registrar:', error.message);
            } else {
                console.log('\n¡Petición enviada con éxito!');
                console.log('ID de Usuario:', data.user?.id);
                console.log('Email:', data.user?.email);

                console.log('\n---------------------------------------------------------');
                console.log('IMPORTANTE:');
                console.log('1. Revisa tu bandeja de entrada y confirma el email (si está activado en Supabase).');
                console.log('2. Si el email no llega o quieres forzar el rol sin confirmar, ');
                console.log('   ejecuta este SQL en el Dashboard de Supabase:');
                console.log(`\n   UPDATE profiles SET role = 'admin' WHERE email = '${email}';`);
                console.log('---------------------------------------------------------');
            }

            rl.close();
        });
    });
});
