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
    // Sanitize username
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

    if (!cleanUsername) {
        return res.status(400).json({ error: 'Username tidak valid (gunakan huruf & angka)' });
    }

    const email = `${cleanUsername}@demo.com`;

    try {
        // 1. Initial SignUp Attempt
        let { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: cleanUsername === 'admin' ? 'admin' : 'user',
                    username: cleanUsername
                }
            }
        });

        // 2. Handle "User already registered" logic
        if (error && error.message.includes('already registered')) {
            console.log(`[Register] User ${cleanUsername} exists in Auth. Checking database...`);

            // Check if user exists in REAL database
            const { data: dbUser } = await supabase
                .from('users')
                .select('id')
                .eq('username', cleanUsername)
                .single();

            if (!dbUser) {
                console.log(`[Register] User ${cleanUsername} is a GHOST (missing in DB). Deleting from Auth...`);

                // Get User ID from Auth Admin to delete it
                // Using listUsers to find by email since we don't have ID from signUp error
                // Limitation: listUsers might not be efficient for huge lists, but fine here
                // Better: Get user by email
                // Note: supabase-js v2 admin api style
                // better: fetch with higher limit to ensure we find the user
                const { data: userData, error: fetchError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

                if (fetchError) {
                    console.error("[Register] Failed to list users:", fetchError);
                    throw new Error("Gagal mengecek status akun (Admin List Error)");
                }

                const ghostUser = userData?.users?.find(u => u.email === email);

                if (ghostUser) {
                    // RESURRECTION STRATEGY (SOLUSI: BANGKIT KUBUR)
                    // Karena "Delete" gagal (terkunci database), kita pakai "Update" saja.
                    console.log(`[Register] Resurrecting ghost user ${ghostUser.id}...`);

                    const { data: updatedAuth, error: updateError } = await supabase.auth.admin.updateUserById(
                        ghostUser.id,
                        {
                            password: password,
                            user_metadata: {
                                username: cleanUsername,
                                role: cleanUsername === 'admin' ? 'admin' : 'user'
                            }
                        }
                    );

                    if (updateError) {
                        console.error("Failed to resurrect (update password):", updateError);
                        throw new Error(`Gagal memulihkan akun: ${updateError.message}`);
                    }

                    console.log(`[Register] Password updated for ${cleanUsername}. Proceeding to sync profile...`);

                    // Siapkan data seolah-olah baru login/register berhasil
                    data = { user: updatedAuth.user, session: null };
                    error = null; // Clear error agar kode lanjut ke proses sync database
                } else {
                    console.error(`[Register] Supabase says "Already Registered" but user not found in Admin List [email=${email}]`);
                    return res.status(409).json({ error: 'Username macet (Ghost). Gagal membersihkan otomatis. Hubungi Admin.' });
                }
            } else {
                return res.status(409).json({ error: 'Username sudah digunakan oleh user lain.' });
            }
        }

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
        console.error("Register Error:", error);
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
        // Use the USER'S token to check their own record. This respects RLS and works even if Service Key is missing.
        const userClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
            global: {
                headers: {
                    Authorization: `Bearer ${data.session.access_token}`,
                },
            },
        });

        const { data: userRecord, error: userError } = await userClient
            .from('users')
            .select('id, role, username')
            .eq('id', data.user.id)
            .single();

        console.log(`[Login Debug] User ID: ${data.user.id}`);
        console.log(`[Login Debug] User Record found:`, userRecord);

        if (userError || !userRecord) {
            console.warn(`[Login Blocked] User ${cleanUsername} (ID: ${data.user.id}) authenticated but not found in public.users`);
            return res.status(403).json({ error: 'Akses ditolak: Akun Anda tidak ditemukan atau telah dihapus.' });
        }

        if (userError || !userRecord) {
            console.warn(`[Login Blocked] User ${cleanUsername} (ID: ${data.user.id}) authenticated but not found in public.users`);
            // Only return error if it's truly missing (PGRST116 is "Row not found")
            // If it's another error (like permission denied), we should probably log it but maybe be careful blocking?
            // Actually, if we can't verify them, we SHOULD block.
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
