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
 *           example: 1
 *         name:
 *           type: string
 *           description: Nama produk
 *           example: "Kemeja Flanel Kotak-Kotak"
 *         price:
 *           type: number
 *           description: Harga produk
 *           example: 150000
 *         stock:
 *           type: integer
 *           description: Stok tersedia
 *           example: 50
 *         category:
 *           type: string
 *           description: Kategori produk
 *           example: "Pakaian Pria"
 *         image:
 *           type: string
 *           description: URL gambar produk
 *           example: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80"
 *         description:
 *           type: string
 *           description: Deskripsi produk
 *           example: "Kemeja flanel bahan katun adem, cocok untuk santai maupun kuliah."
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
