import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uijtnyffwfzbpclxiyzs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpanRueWZmd2Z6YnBjbHhpeXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjUwMzQsImV4cCI6MjA4NzQ0MTAzNH0.xkPRIWMa9klzPhZmqC_7bvc-kWegGqmSQ6n6aZahDYE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkProfiles() {
    console.log('Checking Profiles...');
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) {
        console.error('Error fetching profiles:', error);
    } else {
        console.log('Profiles found:', JSON.stringify(data, null, 2));
    }
}

checkProfiles();
