require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Supabase Error:', error.message);
            console.error('Details:', error);
        } else {
            console.log('✅ Success! Data:', data);
        }
    } catch (err) {
        console.error('❌ Unexpected Error:', err.message);
    }
}

testConnection();
