import React, { useState, useEffect } from 'react';
import { Star, MapPin, Check, Heart } from 'lucide-react';
import { addToWishlist, removeFromWishlist, checkWishlistStatus } from '../services/api';

const ProductCard = ({ product, addToCart, onClick }) => {
    const [isAdded, setIsAdded] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [user, setUser] = useState(null);
    const isSoldOut = product.stock === 0;

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            checkStatus(parsedUser.id);
        }
    }, [product.id]);

    const checkStatus = async (userId) => {
        try {
            const { isWishlisted } = await checkWishlistStatus(userId, product.id);
            setIsWishlisted(isWishlisted);
        } catch (error) {
            console.error("Failed to check wishlist status", error);
        }
    };

    const handleWishlistToggle = async (e) => {
        e.stopPropagation();
        if (!user) {
            alert("Silakan login untuk menyimpan ke wishlist!"); // Simple alert for now, or use Toast if available
            return;
        }

        try {
            if (isWishlisted) {
                await removeFromWishlist(user.id, product.id);
                setIsWishlisted(false);
            } else {
                await addToWishlist(user.id, product.id);
                setIsWishlisted(true);
            }
        } catch (error) {
            console.error("Failed to update wishlist", error);
        }
    };

    const handleAddToCart = (e) => {
        e.stopPropagation();
        if (isSoldOut) return;

        addToCart(product);
        setIsAdded(true);

        // Reset state after 1.5 seconds
        setTimeout(() => {
            setIsAdded(false);
        }, 1500);
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 overflow-hidden flex flex-col cursor-pointer group ${isSoldOut ? 'opacity-75 grayscale' : ''}`}
        >
            <div className="relative pt-[40%] overflow-hidden">
                <img
                    src={product.image || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=300&q=80'}
                    alt={product.name}
                    className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlistToggle}
                    className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all z-20"
                >
                    <Heart
                        size={14}
                        className={`transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                    />
                </button>

                {isSoldOut && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <span className="text-white font-bold text-sm tracking-wider border border-white px-2 py-0.5 -rotate-12">HABIS</span>
                    </div>
                )}
            </div>

            <div className="p-2 flex-1 flex flex-col">
                <h3 className="text-xs text-gray-700 line-clamp-1 mb-0.5 leading-snug font-medium">{product.name}</h3>
                <div className="font-bold text-gray-900 text-sm mb-1">
                    Rp {parseInt(product.price).toLocaleString('id-ID')}
                </div>

                <div className="mt-auto">
                    <div className="flex items-center space-x-1 mb-0.5">
                        <div className="bg-red-100 text-red-600 text-[9px] font-bold px-1 rounded">10%</div>
                        <span className="text-[9px] text-gray-400 line-through">Rp {(product.price * 1.1).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center text-[10px] text-gray-500 space-x-1">
                        <MapPin size={9} />
                        <span className="truncate">{product.location || 'Jakarta Pusat'}</span>
                    </div>
                    <div className="flex items-center text-[10px] text-gray-500 mt-0.5 space-x-1">
                        <Star size={9} className="text-yellow-400 fill-yellow-400" />
                        <span>{product.rating || '4.5'}</span>
                        <span className="text-gray-300">|</span>
                        <span>{product.sold || '10+'}</span>
                        <span className="text-gray-300">|</span>
                        <span className={isSoldOut ? 'text-red-500 font-bold' : ''}>Stok: {product.stock}</span>
                    </div>
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={isAdded || isSoldOut}
                    className={`mt-2 w-full text-[10px] font-bold py-1 rounded transition-all duration-300 flex items-center justify-center gap-1
                        ${isSoldOut
                            ? 'bg-gray-200 text-gray-400 border border-gray-200 cursor-not-allowed'
                            : isAdded
                                ? 'bg-green-600 text-white border border-green-600'
                                : 'border border-[#4B5563] text-[#4B5563] hover:bg-[#4B5563] hover:text-white'
                        }`}
                >
                    {isSoldOut ? (
                        'Habis'
                    ) : isAdded ? (
                        <>
                            <Check size={12} />
                            <span>Masuk</span>
                        </>
                    ) : (
                        '+ Keranjang'
                    )}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
