const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Gunakan Service Role Key jika ada untuk bypass RLS (Admin privileges)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(process.env.SUPABASE_URL, supabaseKey);

exports.getAllUsers = async (req, res) => {
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

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'User not found' });

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Karena kita sudah punya Trigger di DB (full_sync.sql),
        // Hapus di public.users -> OTOMATIS hapus di Auth.
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ message: 'User deleted successfully (Cascaded to Auth)' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
