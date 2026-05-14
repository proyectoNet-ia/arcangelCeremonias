
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://uijtnyffwfzbpclxiyzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpanRueWZmd2Z6YnBjbHhpeXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjUwMzQsImV4cCI6MjA4NzQ0MTAzNH0.xkPRIWMa9klzPhZmqC_7bvc-kWegGqmSQ6n6aZahDYE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectStorageTable() {
    console.log('--- Inspecting storage.objects via public schema (if allowed) ---');
    // Supabase often exposes storage.objects via a view or if we use the service key.
    // With anon key, it's unlikely we can query storage.objects directly.
    // But we can try querying our own site_config or something to see if we can do RPC.

    // Instead, let's just list the catalog bucket recursive?
    console.log('--- Recursive List of catalog bucket ---');
    // list() doesn't support recursive in the JS client easily, but we can iterate.
    const folders = ['', 'products', 'hero', 'branding', 'files'];
    for (const f of folders) {
        const { data, error } = await supabase.storage.from('catalog').list(f);
        if (data) {
            console.log(`Folder "${f}":`, data.map(obj => obj.name));
        }
    }
}

inspectStorageTable();
