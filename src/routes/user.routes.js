import express from 'express';

import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';

import authMiddleware from '../middleware/authMiddleware.js';
import requireAdmin from '../middleware/requireAdmin.js';

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// GET /api/users - Admin only
router.get('/', requireAdmin, getAllUsers);

// GET /api/users/:id - Ownership check will be added in controller
router.get('/:id', getUserById);

// POST /api/users - Admin only
router.post('/', requireAdmin, createUser);

// PUT /api/users/:id - Ownership check will be added in controller
router.put('/:id', updateUser);

// DELETE /api/users/:id - Admin only
router.delete('/:id', requireAdmin, deleteUser);

export default router;
