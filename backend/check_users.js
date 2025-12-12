require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Use Service Role to bypass RLS and see the TRUTH
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUsers() {
    console.log("🔍 Checking Database Users (Bypassing RLS)...");

    // Check 'nganu'
    const { data: users, error } = await supabase
        .from('users')
        .select('*');

    if (error) {
        console.error("❌ Error fetching users:", error);
    } else {
        console.log(`✅ Found ${users.length} users in 'public.users':`);
        users.forEach(u => {
            console.log(`   - [${u.username}] Role: ${u.role}, ID: ${u.id}`);
        });
    }
}

checkUsers();
