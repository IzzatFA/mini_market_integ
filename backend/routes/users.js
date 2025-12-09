const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/userController');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Manajemen pengguna
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Ambil semua pengguna
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Daftar semua pengguna
 *       500:
 *         description: Server error
 */
router.get('/', getAllUsers);

module.exports = router;
