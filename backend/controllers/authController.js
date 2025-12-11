const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
const supabase = createClient(process.env.SUPABASE_URL, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const register = async (req, res) => {
    const { username, password } = req.body;
    // Sanitize username: remove spaces, lowercase, keep only alphanumeric, dot, underscore, hyphen
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

    if (!cleanUsername) {
        return res.status(400).json({ error: 'Username tidak valid (gunakan huruf & angka)' });
    }

    const email = `${cleanUsername}@demo.com`; // Dummy email logic

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: cleanUsername === 'admin' ? 'admin' : 'user',
                    username: cleanUsername // Store username in metadata too for easy access
                }
            }
        });

        if (error) throw error;

        // Sync to public.users table
        if (data.user) {
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    id: data.user.id,
                    username: cleanUsername,
                    email: email,
                    role: cleanUsername === 'admin' ? 'admin' : 'user'
                }]);

            if (insertError) console.error('Failed to sync user:', insertError);
        }

        res.status(201).json({ message: 'User registered successfully', user: data.user });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    // Apply same sanitization for login
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    const email = `${cleanUsername}@demo.com`; // Dummy email logic

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        if (error) throw error;

        // STRICT CHECK: Verify user exists in public.users table
        // Jika user dihapus dari tabel users tapi masih ada di Auth, tolak login
        const { data: userRecord, error: userError } = await supabase
            .from('users')
            .select('id, role, username') // Fetch role too to ensure we have latest data
            .eq('id', data.user.id)
            .single();

        if (userError || !userRecord) {
            console.warn(`[Login Blocked] User ${cleanUsername} (ID: ${data.user.id}) authenticated but not found in public.users`);
            return res.status(403).json({ error: 'Akses ditolak: Akun Anda tidak ditemukan atau telah dihapus.' });
        }

        // Update session info from actual database record if needed
        const finalUser = {
            ...data.user,
            role: userRecord.role,  // Trust DB role over metadata
            username: userRecord.username
        };

        res.status(200).json({ message: 'Login successful', session: data.session, user: finalUser });
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

module.exports = { register, login };
