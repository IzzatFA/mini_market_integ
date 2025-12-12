-- SCRIPT: fix_rls.sql
-- FUNGSI: Memberi izin kepada User untuk melihat profilnya sendiri (agar tidak dianggap "Hantu" saat login)

-- 1. Pastikan RLS Aktif
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Hapus Policy Lama (jika ada, biar bersih)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;

-- 3. Buat Policy Baru: User boleh melihat data jika ID-nya cocok dengan ID Login (Auth UID)
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING ( auth.uid() = id );

-- 4. Buat Policy Baru: Admin (Service Role) boleh melihat semuanya
-- (Biasanya Service Role otomatis bypass, tapi ini untuk jaga-jaga jika pakai client admin biasa)
CREATE POLICY "Admins can view all profiles"
ON public.users
FOR ALL
TO service_role
USING ( true )
WITH CHECK ( true );

-- 5. Tambahan: Izinkan Insert saat Register (untuk authenticated user baru)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK ( auth.uid() = id );

SELECT '✅ RLS Policies Fixed! User can now see their own profile.' as status;
