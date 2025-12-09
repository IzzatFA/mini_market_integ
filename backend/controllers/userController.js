const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Gunakan Service Role Key jika ada untuk bypass RLS (Admin privileges)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(process.env.SUPABASE_URL, supabaseKey);

const getAllUsers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*') // Sekarang backend punya izin admin untuk baca semua data
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Return kosong array jika tidak ada data, bukan error 404
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAllUsers
};
