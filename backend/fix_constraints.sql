-- SALIN KODE INI DAN JALANKAN DI SUPABASE -> SQL EDITOR
-- Script ini akan memodifikasi database agar "Delete User" otomatis menghapus data terkait (Cascade)

-- 1. Hubungkan public.users dengan auth.users (Cascade Auth -> Public)
ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_id_fkey; -- Hapus constraint lama jika ada

ALTER TABLE public.users
ADD CONSTRAINT users_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 2. Hubungkan orders dengan public.users (Cascade Users -> Orders)
-- Asumsi nama kolomnya user_id
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- 3. Hubungkan wishlist dengan public.users (Cascade Users -> Wishlist)
ALTER TABLE public.wishlist
DROP CONSTRAINT IF EXISTS wishlist_user_id_fkey;

ALTER TABLE public.wishlist
ADD CONSTRAINT wishlist_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.users(id)
ON DELETE CASCADE;

-- 4. Hubungkan order_items dengan orders (jika tabel ini ada)
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_order_id_fkey;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_order_id_fkey
FOREIGN KEY (order_id)
REFERENCES public.orders(id)
ON DELETE CASCADE;

-- Notifikasi suskes
SELECT 'Constraints updated successfully! Deleting a user will now clean up everything.' as message;
