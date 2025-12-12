require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function findGhosts() {
    console.log("🔍 Scanning for Ghost Accounts...");

    // 1. Get ALL Auth Users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (authError) {
        console.error("Auth Fail:", authError);
        return;
    }
    const authUsers = authData.users;

    // 2. Get ALL DB Users
    const { data: dbData, error: dbError } = await supabase.from('users').select('id, username');
    if (dbError) {
        console.error("DB Fail:", dbError);
        return;
    }
    const dbUserIds = new Set(dbData.map(u => u.id));

    // 3. Compare
    console.log(`\n📊 Stats:`);
    console.log(`- Total Auth Accounts: ${authUsers.length}`);
    console.log(`- Total DB Profiles:   ${dbData.length}`);

    console.log(`\n👻 GHOST ACCOUNTS (In Auth but MISSING in DB):`);
    let ghostCount = 0;
    authUsers.forEach(u => {
        if (!dbUserIds.has(u.id)) {
            ghostCount++;
            console.log(`[Ghost] ${u.email} (ID: ${u.id})`);
            // Optional: metadata might have original username
            if (u.user_metadata?.username) {
                console.log(`        Original Username: ${u.user_metadata.username}`);
            }
        }
    });

    if (ghostCount === 0) console.log("✅ No Ghost Accounts found. All clean!");
    else console.log(`\n⚠️ Found ${ghostCount} Ghost Accounts.`);
}

findGhosts();
