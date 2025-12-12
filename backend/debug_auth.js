require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- Configuration Check ---');
console.log('SUPABASE_URL:', url ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_KEY (Anon):', anonKey ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? '✅ Set' : '❌ MISSING (Required for backend to check users)');

const supabase = createClient(url, serviceKey || anonKey);

async function checkUser() {
    console.log('\n--- Database Check ---');
    console.log('Attempting to fetch users using configured key...');

    const { data, error } = await supabase.from('users').select('*').limit(5);

    if (error) {
        console.error('❌ Check Failed:', error.message);
        if (error.code === '42501') {
            console.error('   -> RLS Permission Denied! You are likely using the Anon Key but logic requires Service Key.');
        }
    } else {
        console.log(`✅ Success! Found ${data.length} users.`);
        data.forEach(u => console.log(`   - ${u.username} (${u.role})`));
    }
}

checkUser();
