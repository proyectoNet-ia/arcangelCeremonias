import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uijtnyffwfzbpclxiyzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpanRueWZmd2Z6YnBjbHhpeXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjUwMzQsImV4cCI6MjA4NzQ0MTAzNH0.xkPRIWMa9klzPhZmqC_7bvc-kWegGqmSQ6n6aZahDYE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    console.log("Fetching categories...");
    const { data: categories, error } = await supabase.from('categories').select('*');
    if (error) {
        console.error("Error fetching categories", error);
        return;
    }

    console.log("Categories length:", categories.length);
    console.log("Categories data:", JSON.stringify(categories, null, 2));
}

main();
