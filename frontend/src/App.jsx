import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Wishlist from './components/Wishlist';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import Register from './components/Register';

import { ToastProvider, useToast } from './context/ToastContext';

function AppContent() {
    const [cartItems, setCartItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { addToast } = useToast();

    // ... addToCart logic ...

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
        addToast(`${product.name} masuk keranjang!`, 'success');
    };

    const removeFromCart = (id) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <Router>
            <Routes>
                {/* Main Layout Routes with Navbar */}
                <Route
                    path="/*"
                    element={
                        <div className="min-h-screen font-sans">
                            <Navbar cartCount={cartCount} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                            <Routes>
                                <Route path="/" element={<ProductList addToCart={addToCart} searchTerm={searchTerm} />} />
                                <Route
                                    path="/cart"
                                    element={
                                        <Cart
                                            cartItems={cartItems}
                                            removeFromCart={removeFromCart}
                                            clearCart={clearCart}
                                        />
                                    }
                                />
                                <Route path="/wishlist" element={<Wishlist />} />
                            </Routes>
                        </div>
                    }
                />

                {/* Standalone Auth Routes without Navbar */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        </Router>
    );
}

function App() {
    return (
        <ToastProvider>
            <AppContent />
        </ToastProvider>
    );
}

export default App;
