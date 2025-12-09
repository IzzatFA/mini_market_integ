const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

/**
 * @swagger
 * tags:
 *   name: Wishlist
 *   description: Wishlist management
 */

/**
 * @swagger
 * /api/wishlist:
 *   get:
 *     summary: Get user's wishlist
 *     tags: [Wishlist]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of wishlist items
 */
router.get('/', wishlistController.getWishlist);

/**
 * @swagger
 * /api/wishlist:
 *   post:
 *     summary: Add item to wishlist
 *     tags: [Wishlist]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - product_id
 *             properties:
 *               user_id:
 *                 type: string
 *               product_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Item added
 */
router.post('/', wishlistController.addToWishlist);

/**
 * @swagger
 * /api/wishlist:
 *   delete:
 *     summary: Remove item from wishlist
 *     tags: [Wishlist]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removed
 */
router.delete('/', wishlistController.removeFromWishlist);

/**
 * @swagger
 * /api/wishlist/status:
 *   get:
 *     summary: Check if product is in wishlist
 *     tags: [Wishlist]
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: product_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status returned
 */
router.get('/status', wishlistController.checkWishlistStatus);

module.exports = router;
