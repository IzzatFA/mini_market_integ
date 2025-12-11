import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const getProducts = async () => {
    const response = await axios.get(`${API_URL}/products?t=${new Date().getTime()}`);
    return response.data;
};

export const createOrder = async (orderData) => {
    const response = await axios.post(`${API_URL}/orders`, orderData);
    return response.data;
};

export const login = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/login`, credentials);
    return response.data;
};

export const register = async (credentials) => {
    const response = await axios.post(`${API_URL}/auth/register`, credentials);
    return response.data;
};

export const getOrders = async () => {
    const response = await axios.get(`${API_URL}/orders?t=${new Date().getTime()}`);
    return response.data;
};

export const getUsers = async () => {
    const response = await axios.get(`${API_URL}/users?t=${new Date().getTime()}`);
    return response.data;
};

export const getUser = async (id) => {
    const response = await axios.get(`${API_URL}/users/${id}`);
    return response.data;
};

export const addProduct = async (productData) => {
    const response = await axios.post(`${API_URL}/products`, productData);
    return response.data;
};

export const updateProduct = async (id, productData) => {
    const response = await axios.put(`${API_URL}/products/${id}`, productData);
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await axios.delete(`${API_URL}/products/${id}`);
    return response.data;
};

export const getWishlist = async (userId) => {
    const response = await axios.get(`${API_URL}/wishlist`, { params: { user_id: userId, t: new Date().getTime() } });
    return response.data;
};

export const addToWishlist = async (userId, productId) => {
    const response = await axios.post(`${API_URL}/wishlist`, { user_id: userId, product_id: productId });
    return response.data;
};

export const removeFromWishlist = async (userId, productId) => {
    const response = await axios.delete(`${API_URL}/wishlist`, { params: { user_id: userId, product_id: productId } });
    return response.data;
};

export const checkWishlistStatus = async (userId, productId) => {
    // This might fail if param is missing, but our controller handles it.
    // However, if productId is null/undefined (e.g. not selected), we should handle it.
    if (!productId) return { isWishlisted: false };
    const response = await axios.get(`${API_URL}/wishlist/status`, { params: { user_id: userId, product_id: productId } });
    return response.data;
};
