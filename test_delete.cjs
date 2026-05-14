
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://uijtnyffwfzbpclxiyzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpanRueWZmd2Z6YnBjbHhpeXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjUwMzQsImV4cCI6MjA4NzQ0MTAzNH0.xkPRIWMa9klzPhZmqC_7bvc-kWegGqmSQ6n6aZahDYE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
    const path = 'products/1773245415730_i2kfga.jpg';
    console.log(`Attempting to delete: ${path}`);

    const { data, error } = await supabase.storage
        .from('catalog')
        .remove([path]);

    if (error) {
        console.error('Delete Error:', error);
    } else {
        console.log('Delete Response:', data);
        if (data && data.length === 0) {
            console.log('Warning: No files were deleted (maybe path incorrect or permission denied?)');
        }
    }
}

testDelete();
