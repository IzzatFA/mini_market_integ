import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, X } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleNavigate = (path) => {
        onClose();
        navigate(path);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogIn size={24} className="text-[#4B5563]" />
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        Silakan Masuk
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Anda perlu login terlebih dahulu untuk menambahkan barang ke keranjang belanja.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleNavigate('/login')}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#4B5563] text-white font-semibold rounded-xl hover:bg-gray-700 transition-colors"
                        >
                            <LogIn size={18} />
                            Masuk Akun
                        </button>

                        <button
                            onClick={() => handleNavigate('/register')}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            <UserPlus size={18} />
                            Daftar Baru
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
