import React, { useEffect, useState } from 'react';
import { ShoppingCart, Search, User, LogOut, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import { getUser } from '../services/api';

const Navbar = ({ cartCount, searchTerm, setSearchTerm }) => {
    const [user, setUser] = useState(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Cek user dari localStorage saat pertama load
        const storedUser = localStorage.getItem('user');

        const validateSession = async (userData) => {
            if (!userData || !userData.id) return;
            try {
                // Verify user exists in backend with simple fetch
                await getUser(userData.id);
            } catch (error) {
                console.error("Session validation failed:", error);
                // If 404 or other error, clear session
                localStorage.removeItem('user');
                setUser(null);
                window.dispatchEvent(new Event('storage'));
                navigate('/');
            }
        };

        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                validateSession(parsedUser);
            } catch (e) {
                console.error("Invalid user data in localStorage", e);
                localStorage.removeItem('user');
            }
        }

        // Listener untuk update state jika ada perubahan di localStorage (login/logout)
        const handleStorageChange = () => {
            const updatedUser = localStorage.getItem('user');
            if (updatedUser) {
                try {
                    setUser(JSON.parse(updatedUser));
                } catch (e) {
                    console.error("Invalid user data in localStorage", e);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const handleLogout = async () => {
        localStorage.removeItem('user');
        setUser(null);
        window.dispatchEvent(new Event('storage')); // Trigger update
        navigate('/');
    };

    const handleRestrictedAccess = (e, path) => {
        if (!user) {
            e.preventDefault();
            setShowAuthModal(true);
        }
    };

    return (
        <>
            <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm font-sans">
                <div className="container mx-auto px-4 py-3 flex items-center gap-6">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold text-[#4B5563] tracking-tight whitespace-nowrap">
                        Yuk Belanja!
                    </Link>

                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#4B5563] focus-within:ring-1 focus-within:ring-[#4B5563] transition-all h-10">
                            <div className="pl-3 text-gray-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari di Yuk Belanja!"
                                className="w-full px-3 py-2 outline-none text-sm text-gray-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Cart & Menu */}
                    <div className="flex items-center space-x-6">
                        <Link
                            to="/wishlist"
                            onClick={(e) => handleRestrictedAccess(e, '/wishlist')}
                            className="relative group text-gray-500 hover:text-red-500 transition-colors"
                        >
                            <Heart size={22} />
                        </Link>

                        <Link
                            to="/cart"
                            onClick={(e) => handleRestrictedAccess(e, '/cart')}
                            className="relative group"
                        >
                            <ShoppingCart size={22} className="text-gray-500 group-hover:text-[#4B5563] transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <div className="h-6 w-px bg-gray-300 mx-2"></div>

                        <div className="flex items-center space-x-3">
                            {user ? (
                                <div className="flex items-center gap-4">
                                    {/* Admin Link */}
                                    {(user.role === 'admin' || user.user_metadata?.role === 'admin' || user.user_metadata?.username === 'admin' || (user.email && user.email.startsWith('admin'))) && (
                                        <Link to="/admin" className="text-gray-500 hover:text-[#4B5563] font-medium text-sm flex items-center gap-1 transition-colors">
                                            <User size={16} />
                                            Admin Panel
                                        </Link>
                                    )}

                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                        <User size={18} />
                                        <span className="hidden md:inline">{user?.email?.split('@')[0] || 'User'}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-500 hover:text-red-600 transition-colors"
                                        title="Keluar"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login">
                                        <button className="border border-[#4B5563] text-[#4B5563] px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-green-50 transition-colors">
                                            Masuk
                                        </button>
                                    </Link>
                                    <Link to="/register">
                                        <button className="bg-[#4B5563] text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors">
                                            Daftar
                                        </button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
    );
};

export default Navbar;
