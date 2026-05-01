import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('Checking Supabase connection...');
    const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
    if (error) {
        console.error('Error fetching products count:', error);
    } else {
        console.log('Products count:', data);
    }

    const { data: categories, error: catError } = await supabase.from('categories').select('count', { count: 'exact', head: true });
    if (catError) {
        console.error('Error fetching categories count:', catError);
    } else {
        console.log('Categories count:', categories);
    }
}

check();
