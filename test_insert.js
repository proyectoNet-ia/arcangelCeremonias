import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uijtnyffwfzbpclxiyzs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpanRueWZmd2Z6YnBjbHhpeXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjUwMzQsImV4cCI6MjA4NzQ0MTAzNH0.xkPRIWMa9klzPhZmqC_7bvc-kWegGqmSQ6n6aZahDYE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
    console.log('Testing profile insert...');
    // Using a random UUID
    const testId = '00000000-0000-0000-0000-000000000001';
    const { data, error } = await supabase.from('profiles').insert([
        { id: testId, email: 'test@example.com', full_name: 'Test Admin', role: 'admin' }
    ]);

    if (error) {
        console.error('Insert failed (expected if RLS is on):', error.message);
    } else {
        console.log('Insert successful! RLS might be open or misconfigured.');
    }
}

testInsert();
