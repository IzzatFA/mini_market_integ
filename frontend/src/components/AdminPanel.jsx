import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Search, LogOut, User } from 'lucide-react';
import { getProducts, addProduct, updateProduct, deleteProduct, getOrders, getUsers } from '../services/api';
import { useToast } from '../context/ToastContext';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]); // Real Users state
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const navigate = useNavigate();
    const { addToast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        category: '',
        image: ''
    });

    useEffect(() => {
        checkAdminAccess();
        fetchProducts();
        fetchOrders();
        fetchUsers();
    }, []);

    const checkAdminAccess = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || (user.user_metadata?.role !== 'admin' && user.role !== 'admin')) {
            if (user?.user_metadata?.username !== 'admin' && !(user?.email && user.email.startsWith('admin'))) {
                addToast('Akses Ditolak: Halaman ini khusus Admin.', 'error');
                navigate('/');
            }
        }
    };

    const fetchProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        try {
            const data = await getOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Sanitize inputs (remove dots from price if user uses 12.000 format)
        const payload = {
            ...formData,
            price: parseInt(formData.price.toString().replace(/\./g, '')),
            stock: parseInt(formData.stock.toString().replace(/\./g, ''))
        };

        try {
            if (isEditing) {
                await updateProduct(currentProduct.id, payload);
                addToast('Produk berhasil diperbarui', 'success');
            } else {
                await addProduct(payload);
                addToast('Produk berhasil ditambahkan', 'success');
            }
            setShowForm(false);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Operation failed', error);
            addToast('Gagal menyimpan produk', 'error');
        }
    };

    const handleEdit = (product) => {
        setIsEditing(true);
        setCurrentProduct(product);
        setFormData({
            name: product.name,
            price: product.price,
            stock: product.stock,
            category: product.category,
            image: product.image
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus produk ini?')) {
            try {
                await deleteProduct(id);
                fetchProducts();
                addToast('Produk berhasil dihapus', 'success');
            } catch (error) {
                console.error('Delete failed', error);
                addToast('Gagal menghapus produk', 'error');
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', price: '', stock: '', category: '', image: '' });
        setIsEditing(false);
        setCurrentProduct(null);
    };

    const filteredProducts = Array.isArray(products) ? products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    if (loading) return <div className="text-center p-10">Loading...</div>;

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-[#4B5563] text-white flex flex-col hidden md:flex">
                <div className="p-6 border-b border-gray-600">
                    <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
                    <p className="text-xs text-gray-400 mt-1">Manage Yuk Belanja!</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-3 w-full p-3 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors mb-4 border-b border-gray-600 pb-4"
                    >
                        <LogOut className="rotate-180" size={20} />
                        <span className="font-medium">Kembali ke Beranda</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                        <Package size={20} />
                        <span className="font-medium">Products</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                        <span className="font-medium flex items-center gap-3"><Package size={20} /> Orders</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                    >
                        <span className="font-medium flex items-center gap-3"><User size={20} /> Users</span>
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-600">
                    <button
                        onClick={() => {
                            localStorage.removeItem('user');
                            window.dispatchEvent(new Event('storage'));
                            navigate('/');
                        }}
                        className="flex items-center space-x-2 text-gray-300 hover:text-white"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-8">
                {activeTab === 'products' && (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">Daftar Produk</h2>
                                <p className="text-gray-500">Kelola katalog produk Anda di sini.</p>
                            </div>
                            <button
                                onClick={() => { resetForm(); setShowForm(true); }}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-bold flex items-center transition-colors shadow-sm"
                            >
                                <Plus size={20} className="mr-2" />
                                Tambah Produk
                            </button>
                        </div>

                        {/* Search */}
                        <div className="mb-6 relative max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4B5563]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Products Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#4B5563] text-white">
                                    <tr>
                                        <th className="p-4 text-sm font-semibold">Produk</th>
                                        <th className="p-4 text-sm font-semibold">Harga</th>
                                        <th className="p-4 text-sm font-semibold">Stok</th>
                                        <th className="p-4 text-sm font-semibold">Kategori</th>
                                        <th className="p-4 text-sm font-semibold text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover bg-gray-100" />
                                                    <span className="font-medium text-gray-900">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600">Rp {parseInt(product.price).toLocaleString('id-ID')}</td>
                                            <td className="p-4 text-gray-600">{product.stock}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">{product.category}</span>
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleEdit(product)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-gray-500">
                                                Tidak ada produk ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {
                    activeTab === 'orders' && (
                        <>
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">Daftar Pesanan</h2>
                                <p className="text-gray-500">Pantau transaksi yang masuk.</p>
                            </div>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-[#4B5563] text-white">
                                        <tr>
                                            <th className="p-4 text-sm font-semibold">Order ID</th>
                                            <th className="p-4 text-sm font-semibold">Tanggal</th>
                                            <th className="p-4 text-sm font-semibold">Total</th>
                                            <th className="p-4 text-sm font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="p-4 font-mono text-sm">#{order.id}</td>
                                                <td className="p-4 text-gray-600">{new Date(order.created_at).toLocaleDateString('id-ID')}</td>
                                                <td className="p-4 font-medium">Rp {parseInt(order.total_price).toLocaleString('id-ID')}</td>
                                                <td className="p-4">
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold">Lunas</span>
                                                </td>
                                            </tr>
                                        ))}
                                        {orders.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="p-8 text-center text-gray-500">Belum ada pesanan masuk.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )
                }

                {activeTab === 'users' && (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">Daftar Pengguna</h2>
                            <p className="text-gray-500">Total Akun: {users.length}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-[#4B5563] text-white">
                                    <tr>
                                        <th className="p-4 text-sm font-semibold">ID</th>
                                        <th className="p-4 text-sm font-semibold">Username</th>
                                        <th className="p-4 text-sm font-semibold">Email</th>
                                        <th className="p-4 text-sm font-semibold">Role</th>
                                        <th className="p-4 text-sm font-semibold">Bergabung</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {users.map((u) => (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="p-4 text-gray-400 text-xs font-mono">{u.id.substring(0, 8)}...</td>
                                            <td className="p-4 font-medium text-gray-900">{u.username}</td>
                                            <td className="p-4 text-gray-600">{u.email}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs rounded-full font-bold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {u.role ? u.role.toUpperCase() : 'USER'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-gray-500">
                                                Belum ada user yang terdaftar (Jalankan Register dulu).
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Modal Form */}
            {
                showForm && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-800">
                                    {isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}
                                </h3>
                                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B5563] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            required
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B5563] focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                                        <input
                                            type="number"
                                            name="stock"
                                            required
                                            value={formData.stock}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B5563] focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                    <select
                                        name="category"
                                        required
                                        value={formData.category}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B5563] focus:border-transparent outline-none bg-white"
                                    >
                                        <option value="" disabled>Pilih Kategori</option>
                                        <option value="Minuman">Minuman</option>
                                        <option value="Elektronik">Elektronik</option>
                                        <option value="Fashion">Fashion</option>
                                        <option value="Rumah Tangga">Rumah Tangga</option>
                                        <option value="Dapur">Dapur</option>
                                        <option value="Aksesoris">Aksesoris</option>
                                        <option value="Kesehatan">Kesehatan</option>
                                        <option value="Olahraga">Olahraga</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                                    <input
                                        type="text"
                                        name="image"
                                        value={formData.image}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4B5563] focus:border-transparent outline-none"
                                        placeholder="https://..."
                                    />
                                    {formData.image && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-500 mb-1">Preview Gambar:</p>
                                            <div className="w-full h-48 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
                                                <img
                                                    src={formData.image}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/400x300?text=Gambar+Tidak+Valid';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-4 flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-[#4B5563] text-white rounded-lg font-bold hover:bg-gray-700 transition"
                                    >
                                        {isEditing ? 'Simpan Perubahan' : 'Tambah Produk'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default AdminPanel;
