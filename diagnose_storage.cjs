
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://uijtnyffwfzbpclxiyzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpanRueWZmd2Z6YnBjbHhpeXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjUwMzQsImV4cCI6MjA4NzQ0MTAzNH0.xkPRIWMa9klzPhZmqC_7bvc-kWegGqmSQ6n6aZahDYE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
    console.log('--- Checking Buckets ---');
    const { data: buckets, error: bError } = await supabase.storage.listBuckets();
    if (bError) console.error('Buckets Error:', bError);
    else console.log('Buckets:', buckets.map(b => b.name));

    const folders = ['products', 'hero', 'branding', 'files'];
    for (const folder of folders) {
        console.log(`\n--- Listing folder: ${folder} ---`);
        const { data: files, error: fError } = await supabase.storage.from('catalog').list(folder);
        if (fError) console.error(`Listing ${folder} Error:`, fError);
        else {
            console.log(`Files in ${folder}:`, files.map(f => f.name));
        }
    }
}

checkStorage();
