import React, { useEffect, useState } from 'react';
import { getWishlist, removeFromWishlist } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2 } from 'lucide-react';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToast } = useToast();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchWishlist(parsedUser.id);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchWishlist = async (userId) => {
        try {
            const data = await getWishlist(userId);
            setWishlistItems(data || []);
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
            addToast("Gagal memuat wishlist", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        if (!user) return;
        try {
            await removeFromWishlist(user.id, productId);
            setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
            addToast("Produk dihapus dari wishlist", "success");
        } catch (error) {
            console.error("Failed to remove from wishlist", error);
            addToast("Gagal menghapus produk", "error");
        }
    };

    if (!user) {
        return (
            <div className="container mx-auto px-4 pt-32 pb-12 min-h-screen text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Silakan Login Terlebih Dahulu</h2>
                <Link to="/login" className="text-[#03AC0E] underline">Login disini</Link>
            </div>
        );
    }

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh] pt-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B5563]"></div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 pt-32 pb-12 min-h-screen font-sans">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-red-500 w-1 h-6 rounded-full"></span>
                Wishlist Saya ({wishlistItems.length})
            </h2>

            {wishlistItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-100">
                    <p className="text-lg font-bold text-gray-700">Wishlist Kosong</p>
                    <p className="text-gray-500 mt-1 text-sm mb-4">Simpan produk favoritmu disini.</p>
                    <Link to="/" className="inline-block px-6 py-2 bg-[#03AC0E] text-white rounded-lg font-bold hover:bg-green-700 transition-colors">
                        Mulai Belanja
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {wishlistItems.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                            <div className="relative pt-[100%] bg-gray-50">
                                <img
                                    src={item.products.image || 'https://placehold.co/300x300'}
                                    alt={item.products.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => handleRemove(item.product_id)}
                                    className="absolute top-2 right-2 p-2 bg-white/80 rounded-full text-red-500 hover:bg-white hover:text-red-600 transition-colors shadow-sm"
                                    title="Hapus dari wishlist"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="p-4 flex-1 flex flex-col">
                                <span className="text-xs text-green-600 font-medium mb-1 px-2 py-0.5 bg-green-50 rounded w-fit">
                                    {item.products.category}
                                </span>
                                <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 min-h-[40px]" title={item.products.name}>
                                    {item.products.name}
                                </h3>
                                <p className="text-[#03AC0E] font-bold text-lg mb-3">
                                    Rp {parseInt(item.products.price).toLocaleString('id-ID')}
                                </p>

                                <div className="mt-auto">
                                    {item.products.stock > 0 ? (
                                        <Link to={`/?search=${encodeURIComponent(item.products.name)}`} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-gray-50 text-gray-600 text-sm font-bold hover:bg-[#03AC0E] hover:text-white transition-all border border-gray-200 hover:border-transparent">
                                            <ShoppingCart size={16} />
                                            Lihat Produk
                                        </Link>
                                    ) : (
                                        <button disabled className="w-full py-2 rounded-lg bg-gray-100 text-gray-400 text-sm font-bold cursor-not-allowed">
                                            Stok Habis
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
