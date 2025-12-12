const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById } = require('../controllers/userController');

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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   username:
 *                     type: string
 *                     example: "johndoe"
 *                   email:
 *                     type: string
 *                     example: "johndoe@example.com"
 *                   role:
 *                     type: string
 *                     example: "user"
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-03-20T10:00:00Z"
 *       500:
 *         description: Server error
 */
router.get('/', getAllUsers);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.delete('/:id', require('../controllers/userController').deleteUser);

module.exports = router;
