import React, { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import ProductCard from './ProductCard';

const ProductList = ({ addToCart, searchTerm }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data || []);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Reset to page 1 when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const filteredProducts = Array.isArray(products) ? products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    // Get current items
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4B5563]"></div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 pt-16 pb-4 min-h-screen font-sans">


            <div className="flex justify-between items-end mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="bg-[#4B5563] w-1 h-6 mr-2 rounded-full"></span>
                    {searchTerm ? `Hasil pencarian: "${searchTerm}"` : 'Daftar Produk'}
                </h2>
                <span className="text-xs text-gray-500 mb-1">
                    Menampilkan {filteredProducts.length > 0 ? indexOfFirstItem + 1 : 0}-{Math.min(indexOfLastItem, filteredProducts.length)} dari {filteredProducts.length} produk
                </span>
            </div>

            {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                    <img
                        src="https://placehold.co/400x320/f3f4f6/a3a3a3?text=Produk+Kosong"
                        alt="Tidak ditemukan"
                        className="w-48 mx-auto mb-6 opacity-75 mix-blend-multiply"
                    />
                    <p className="text-lg font-bold text-gray-700">Produk tidak ditemukan</p>
                    <p className="text-gray-500 mt-1 text-sm">Coba kata kunci lain atau cek ejaanmu.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
                        {currentProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                addToCart={addToCart}
                                onClick={() => setSelectedProduct(product)}
                            />
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-4 space-x-2">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${currentPage === 1
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Previous
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`w-10 h-10 rounded-lg text-sm font-bold transition-colors ${currentPage === i + 1
                                        ? 'bg-[#4B5563] text-white'
                                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedProduct(null)}>
                    <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row animate-scale-up" onClick={e => e.stopPropagation()}>
                        {/* Image Section */}
                        <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 relative">
                            <img
                                src={selectedProduct.image || 'https://placehold.co/400x400'}
                                alt={selectedProduct.name}
                                className="w-full h-full object-cover"
                            />
                            {selectedProduct.stock === 0 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-white font-bold text-2xl border-4 border-white px-6 py-2 -rotate-12">HABIS</span>
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="px-2 py-1 bg-gray-100 rounded-md">{selectedProduct.category || 'Umum'}</span>
                                        <span>•</span>
                                        <span>Stok: {selectedProduct.stock}</span>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-3xl font-bold text-[#03AC0E] mb-2">
                                    Rp {parseInt(selectedProduct.price).toLocaleString('id-ID')}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {selectedProduct.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
                                </p>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        if (selectedProduct.stock > 0) {
                                            addToCart(selectedProduct);
                                            setSelectedProduct(null);
                                        }
                                    }}
                                    disabled={selectedProduct.stock === 0}
                                    className={`w-full py-3 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${selectedProduct.stock === 0
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-[#03AC0E] text-white hover:bg-green-700 shadow-lg hover:shadow-green-200'
                                        }`}
                                >
                                    {selectedProduct.stock === 0 ? 'Stok Habis' : '+ Masukkan Keranjang'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
