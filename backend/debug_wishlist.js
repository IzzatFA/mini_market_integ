const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function test() {
    console.log("Checking users...");
    const { data: users, error: uErr } = await supabase.from('users').select('id');
    if (uErr) console.error("User Check Error:", uErr);
    else console.log("User count:", users ? users.length : 0);

    const { data: products } = await supabase.from('products').select('id').limit(1);
    const productId = products && products.length > 0 ? products[0].id : 1;

    console.log("Attempting insert...");
    // If no users, this WILL fail with FK violation, which confirms table exists and constraint is active.
    // If users exist, use one.
    const userId = users && users.length > 0 ? users[0].id : '00000000-0000-0000-0000-000000000000';

    const { error } = await supabase.from('wishlist').insert([{ user_id: userId, product_id: productId }]);

    if (error) {
        console.error("INSERT Error:", JSON.stringify(error, null, 2));
    } else {
        console.log("INSERT Success");
    }
}

test();
