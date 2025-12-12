-- SCRIPT: full_sync.sql
-- FUNGSI: Menjamin "Satu Hapus, Semua Hapus" (Two-Way Deletion)
-- Jalankan di Supabase > SQL Editor

-- 0. CLEANUP: Hapus data yatim piatu (Orphan Data) dulu
DELETE FROM public.orders WHERE user_id NOT IN (SELECT id FROM public.users);
DELETE FROM public.wishlist WHERE user_id NOT IN (SELECT id FROM public.users);

-- BAGIAN 1: Auth -> Public (Jika hapus dari Menu Auth, Data hilang)
-- Menghubungkan public.users ke auth.users dengan DELETE CASCADE
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_id_fkey;

ALTER TABLE public.users
ADD CONSTRAINT users_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- BAGIAN 2: Public -> Auth (Jika hapus dari Tabel User, Akun Login hilang)
-- Membuat Trigger (Pemicu) otomatis

-- A. Buat Fungsi Penghapus
CREATE OR REPLACE FUNCTION public.delete_auth_user_when_public_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Penting: Agar fungsi punya izin menghapus data Auth
AS $$
BEGIN
  -- Hapus user dari tabel auth.users yang ID-nya sama dengan user yang baru dihapus
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- B. Pasang Fungsi ke Tabel (Trigger)
DROP TRIGGER IF EXISTS on_public_user_delete ON public.users;

CREATE TRIGGER on_public_user_delete
AFTER DELETE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.delete_auth_user_when_public_deleted();

-- BAGIAN 3: Membersihkan Data Sampah Lainnya (Orders, Wishlist)
-- Memastikan jika USER hilang, Order & Wishlist juga hilang (Cascade)

-- Orders
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- Wishlist
ALTER TABLE public.wishlist
DROP CONSTRAINT IF EXISTS wishlist_user_id_fkey;

ALTER TABLE public.wishlist
ADD CONSTRAINT wishlist_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

SELECT '✅ Sinkronisasi 2 Arah Berhasil Dipasang!' as status;
