import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import LoadingScreen from './LoadingScreen';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { addToast } = useToast();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await login({ username, password });
            localStorage.setItem('user', JSON.stringify(data.user));

            // Dispatch event agar Navbar update otomatis
            window.dispatchEvent(new Event('storage'));

            addToast('Login Berhasil!', 'success');

            if (data.user.user_metadata?.role === 'admin' || data.user.role === 'admin' || username === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            addToast(error.response?.data?.error || 'Login gagal', 'error');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-sans p-4 relative">
            {loading && <LoadingScreen />}
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 md:p-10">
                    <div className="text-center mb-8">
                        <Link to="/" className="inline-block text-3xl font-extrabold text-[#4B5563] tracking-tight mb-2 hover:opacity-80 transition-opacity">
                            Yuk Belanja!
                        </Link>
                        <h2 className="text-xl font-semibold text-gray-700">
                            Selamat Datang Kembali
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Masuk dengan username Anda
                        </p>
                    </div>

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B5563] focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B5563] focus:border-transparent transition-all sm:text-sm bg-gray-50 focus:bg-white"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#4B5563] focus:ring-[#4B5563] border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-gray-500">
                                    Ingat saya
                                </label>
                            </div>
                            <a href="#" className="font-medium text-[#4B5563] hover:text-gray-900">
                                Lupa password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#4B5563] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B5563] transform active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            Masuk Sekarang
                            <ArrowRight size={18} className="ml-2" />
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Belum punya akun?</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link
                                to="/register"
                                className="font-bold text-[#4B5563] hover:text-gray-900 transition-colors"
                            >
                                Daftar Akun Baru
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
