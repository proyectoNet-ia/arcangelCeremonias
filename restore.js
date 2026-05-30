import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// 1. Validar que se haya proporcionado un archivo
const backupFileArg = process.argv[2];
if (!backupFileArg) {
    console.error("❌ Error: Debes especificar el archivo de respaldo que deseas restaurar.");
    console.error("Ejemplo: npm run restore backups/backup_db_2026-05-30T23-36-20.json");
    process.exit(1);
}

const backupFilePath = path.resolve(backupFileArg);
if (!fs.existsSync(backupFilePath)) {
    console.error(`❌ Error: No se encontró el archivo: ${backupFilePath}`);
    process.exit(1);
}

// 2. Conectar a Supabase
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
    console.error("❌ Error: No se encontraron las credenciales de Supabase en el archivo .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function restore() {
    console.log("Iniciando restauración de base de datos...");
    console.log(`Leyendo archivo: ${backupFilePath}`);

    try {
        // 3. Leer el JSON
        const rawData = fs.readFileSync(backupFilePath, 'utf-8');
        const backupData = JSON.parse(rawData);

        if (!backupData.categories || !backupData.products) {
            console.error("❌ Error: El archivo no parece ser un respaldo válido. Faltan categorías o productos.");
            process.exit(1);
        }

        // 4. Restaurar Categorías (Upsert)
        console.log(`Restaurando ${backupData.categories.length} categorías...`);
        const { error: catError } = await supabase
            .from('categories')
            .upsert(backupData.categories, { onConflict: 'id' });
        
        if (catError) throw catError;
        console.log("✅ Categorías restauradas con éxito.");

        // 5. Restaurar Productos (Upsert)
        console.log(`Restaurando ${backupData.products.length} productos...`);
        const { error: prodError } = await supabase
            .from('products')
            .upsert(backupData.products, { onConflict: 'id' });
        
        if (prodError) throw prodError;
        console.log("✅ Productos restaurados con éxito.");

        console.log("\n🎉 ¡RESTAURACIÓN COMPLETADA CON ÉXITO! 🎉");
        console.log("Si los datos no se ven reflejados de inmediato en tu web, simplemente recarga la página.");

    } catch (err) {
        console.error("\n❌ Error Crítico durante la restauración:", err);
    }
}

restore();
