const supabase = require('../config/supabaseClient');

const createOrder = async (req, res) => {
    const { items, total_price, user_id } = req.body;
    // items: array of { id, quantity, price } (from frontend cart)

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No items in order' });
    }

    try {
        // 1. Create Order Record
        const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert([{
                user_id: user_id || null, // Allow anonymous if needed, but preferred authenticated
                total_price,
                status: 'paid', // Simulating successful payment
                created_at: new Date()
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        const orderId = orderData.id;

        // 2. Insert Order Items & Update Stock
        for (const item of items) {
            // A. Insert into order_items
            await supabase.from('order_items').insert([{
                order_id: orderId,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            }]);

            // B. Update Product Stock
            // Fetch current stock
            const { data: product } = await supabase.from('products').select('stock').eq('id', item.id).single();
            if (product) {
                const newStock = product.stock - item.quantity;
                if (newStock >= 0) {
                    await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
                } else {
                    console.warn(`Stock insufficient for product ${item.id}`);
                }
            }
        }

        res.status(201).json({ message: 'Order created successfully', order: orderData });
    } catch (err) {
        console.error("Order creation failed:", err);
        res.status(500).json({ error: err.message });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    createOrder,
    getAllOrders
};
