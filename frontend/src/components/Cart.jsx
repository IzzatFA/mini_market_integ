import React from 'react';
import { Trash2, ArrowLeft } from 'lucide-react';
import { createOrder } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Cart = ({ cartItems, removeFromCart, clearCart }) => {
    const navigate = useNavigate();
    const { addToast } = useToast();

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const [showConfirm, setShowConfirm] = React.useState(false);
    const [address, setAddress] = React.useState('');
    const [paymentMethod, setPaymentMethod] = React.useState('');

    const initiateCheckout = () => {
        if (cartItems.length === 0) return;
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            addToast('Silakan login terlebih dahulu untuk melakukan pemesanan.', 'error');
            navigate('/login');
            return;
        }
        setShowConfirm(true);
    };

    const processCheckout = async () => {
        if (!address || !paymentMethod) {
            addToast('Mohon lengkapi alamat dan metode pembayaran.', 'error');
            return;
        }

        setShowConfirm(false);
        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const orderData = {
                user_id: user.id || user.user?.id,
                items: cartItems,
                total_price: total,
                shipping_address: address, // Included for completeness, even if backend ignores it for now
                payment_method: paymentMethod
            };
            await createOrder(orderData);
            addToast('Pembelian Berhasil!', 'success');
            clearCart();
            // Reset form
            setAddress('');
            setPaymentMethod('');
            navigate('/');
        } catch (error) {
            console.error('Checkout failed', error);
            addToast('Checkout failed. Please try again.', 'error');
        }
    };

    return (
        <div className="container mx-auto px-4 pt-32 pb-12 min-h-screen bg-gray-50 font-sans relative">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Keranjang Belanja</h2>

            {cartItems.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                    <img src="/empty-cart.png" alt="Empty Cart" className="w-48 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-bold text-gray-700">Wah, keranjang belanjamu kosong</p>
                    <p className="text-gray-500 mt-1 text-sm">Yuk, isi dengan barang-barang impianmu!</p>
                    <Link to="/" className="inline-block mt-6 bg-[#4B5563] text-white px-8 py-2.5 rounded-lg font-bold hover:bg-green-700 transition-colors">
                        Mulai Belanja
                    </Link>
                </div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex gap-4">
                                <div className="flex items-center">
                                    <input type="checkbox" checked className="w-4 h-4 text-[#4B5563] rounded focus:ring-[#4B5563]" readOnly />
                                </div>
                                <img
                                    src={item.image || 'https://placehold.co/200x200'}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-md"
                                />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">{item.name}</h3>
                                    <p className="text-gray-500 text-xs mt-1">Varian: Default</p>
                                    <div className="mt-2 flex justify-between items-end">
                                        <p className="font-bold text-gray-900">
                                            Rp {parseInt(item.price).toLocaleString('id-ID')}
                                        </p>
                                        <div className="flex items-center space-x-4">
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <div className="flex items-center border border-gray-300 rounded-md">
                                                <span className="px-3 py-1 text-sm font-bold text-gray-600 border-r border-gray-300">{item.quantity}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 sticky top-24">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Ringkasan Belanja</h3>

                            <div className="space-y-2 mb-4 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Total Harga ({totalItems} barang)</span>
                                    <span>Rp {total.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Total Diskon Barang</span>
                                    <span className="text-red-500">-Rp 0</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-bold text-gray-900">
                                    <span>Total Belanja</span>
                                    <span>Rp {total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <button
                                onClick={initiateCheckout}
                                className="w-full bg-[#03AC0E] text-white py-3 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors"
                            >
                                Beli ({totalItems})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Checkout Form Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all scale-100 animate-slide-up max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Detail Pengiriman</h3>

                        {/* Address Form */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Jalan, Nomor Rumah, RT/RW, Kelurahan, Kecamatan..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03AC0E] focus:border-transparent text-sm h-24 resize-none"
                                required
                            />
                        </div>

                        {/* Payment Method */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pembayaran</label>
                            <div className="space-y-2">
                                {['Transfer Bank (BCA/Mandiri)', 'COD (Bayar di Tempat)', 'E-Wallet (GoPay/OVO)'].map((method) => (
                                    <label key={method} className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${paymentMethod === method ? 'border-[#03AC0E] bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={method}
                                            checked={paymentMethod === method}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-4 h-4 text-[#03AC0E] focus:ring-[#03AC0E]"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{method}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-50 p-3 rounded-lg mb-6 flex justify-between items-center text-sm">
                            <span className="text-gray-600">Total Tagihan:</span>
                            <span className="font-bold text-gray-900 text-lg">Rp {total.toLocaleString('id-ID')}</span>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={processCheckout}
                                disabled={!address || !paymentMethod}
                                className="flex-1 px-4 py-2 bg-[#03AC0E] text-white rounded-lg font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Bayar Sekarang
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
