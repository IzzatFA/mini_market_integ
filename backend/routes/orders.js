const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders } = require('../controllers/orderController');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Manajemen pesanan
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Buat pesanan baru
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - total_price
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: Daftar item yang dibeli
 *               total_price:
 *                 type: number
 *                 description: Total harga pesanan
 *     responses:
 *       201:
 *         description: Pesanan berhasil dibuat
 *       500:
 *         description: Server error
 */
router.post('/', createOrder);
router.get('/', getAllOrders);

module.exports = router;
