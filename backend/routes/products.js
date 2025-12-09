const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - stock
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID produk
 *         name:
 *           type: string
 *           description: Nama produk
 *         price:
 *           type: number
 *           description: Harga produk
 *         stock:
 *           type: integer
 *           description: Stok tersedia
 *         category:
 *           type: string
 *           description: Kategori produk
 *         image:
 *           type: string
 *           description: URL gambar produk
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Ambil semua produk
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Daftar semua produk
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Ambil produk berdasarkan ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID produk
 *     responses:
 *       200:
 *         description: Detail produk
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Produk tidak ditemukan
 */
router.get('/:id', getProductById);

router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
