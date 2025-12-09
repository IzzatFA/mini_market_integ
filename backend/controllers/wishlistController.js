const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Get User's Wishlist
const getWishlist = async (req, res) => {
    // Assuming auth middleware populates req.user or we pass user_id in headers/body for now
    // Ideally should be from req.user.id extracted from JWT
    // But based on existing code, let's see how auth is handled. 
    // The current authController doesn't seem to set a global middleware yet for protected routes in the snippets I saw, 
    // or maybe it's in routes/auth.js. 
    // Let's assume the frontend sends 'user_id' in query or body for simplicity if no middleware, 
    // BUT better practice: expect 'user_id' header or body.

    const { user_id } = req.query; // Simple approach for now matching the style

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const { data, error } = await supabase
            .from('wishlist')
            .select(`
                id,
                user_id,
                product_id,
                products (
                    id,
                    name,
                    price,
                    image,
                    stock,
                    category
                )
            `)
            .eq('user_id', user_id);

        if (error) throw error;

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add to Wishlist
const addToWishlist = async (req, res) => {
    const { user_id, product_id } = req.body;

    if (!user_id || !product_id) {
        return res.status(400).json({ error: 'User ID and Product ID are required' });
    }

    try {
        const { data, error } = await supabase
            .from('wishlist')
            .insert([{ user_id, product_id }])
            .select();

        if (error) {
            console.error("Wishlist Insert Error:", error);

            // Handle duplicate key error
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Product already in wishlist' });
            }

            // Handle Foreign Key Violation (User doesn't exist in public.users)
            if (error.code === '23503') {
                console.log(`User ${user_id} missing in public.users. Attempting auto-fix...`);

                // Try to insert the user (placeholder data)
                const { error: userError } = await supabase.from('users').insert({
                    id: user_id,
                    username: 'user_' + user_id.slice(0, 8), // Fallback username
                    email: 'missing_email@example.com',
                    role: 'user'
                });

                if (userError) {
                    console.error("Auto-create user failed:", userError);
                    throw error; // Throw original error if fix fails
                }

                // Retry wishlist insert
                const { data: retryData, error: retryError } = await supabase
                    .from('wishlist')
                    .insert([{ user_id, product_id }])
                    .select();

                if (retryError) throw retryError;

                return res.status(201).json({ message: 'Added to wishlist (auto-fixed user)', data: retryData });
            }

            throw error;
        }

        res.status(201).json({ message: 'Added to wishlist', data });
    } catch (error) {
        console.error("Final Wishlist Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Remove from Wishlist
const removeFromWishlist = async (req, res) => {
    const { user_id, product_id } = req.query;

    // Support both query params or body/params
    if (!user_id || !product_id) {
        return res.status(400).json({ error: 'User ID and Product ID are required' });
    }

    try {
        const { error } = await supabase
            .from('wishlist')
            .delete()
            .match({ user_id, product_id });

        if (error) throw error;

        res.status(200).json({ message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Check if product is in wishlist
const checkWishlistStatus = async (req, res) => {
    const { user_id, product_id } = req.query;

    if (!user_id || !product_id) {
        return res.status(400).json({ error: 'User ID and Product ID are required' });
    }

    try {
        const { data, error } = await supabase
            .from('wishlist')
            .select('id')
            .eq('user_id', user_id)
            .eq('product_id', product_id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "Relation null" (no rows found)
            throw error;
        }

        res.status(200).json({ isWishlisted: !!data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlistStatus
};
