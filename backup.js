import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Lee las variables de entorno del archivo .env localmente
const envPath = path.resolve('.env');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
        if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
        if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
    });
}

if (!supabaseUrl || !supabaseKey) {
    console.error("Error: No se encontraron las credenciales de Supabase en el archivo .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Iniciando respaldo de base de datos...");
    
    // Crear directorio de respaldos si no existe
    const backupDir = path.resolve('backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
    }

    try {
        // 1. Respaldar Categorías
        console.log("Descargando categorías...");
        const { data: categories, error: catError } = await supabase.from('categories').select('*');
        if (catError) throw catError;

        // 2. Respaldar Productos
        console.log("Descargando productos...");
        const { data: products, error: prodError } = await supabase.from('products').select('*');
        if (prodError) throw prodError;

        // 3. Crear archivo JSON con fecha
        const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = path.join(backupDir, `backup_db_${dateStr}.json`);
        
        const backupData = {
            timestamp: new Date().toISOString(),
            categories: categories,
            products: products
        };

        fs.writeFileSync(filename, JSON.stringify(backupData, null, 2));
        console.log(`\n¡Respaldo exitoso! 🎉`);
        console.log(`Se han guardado ${categories.length} categorías y ${products.length} productos.`);
        console.log(`Archivo guardado en: ${filename}`);

    } catch (err) {
        console.error("Error durante el respaldo:", err);
    }
}

main();
