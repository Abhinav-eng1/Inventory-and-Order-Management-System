/**
 * Authentication Routes
 * 
 * Endpoints:
 * - POST /api/auth/register : Register a new user account
 * - POST /api/auth/login    : Log in and receive JWT token
 * - GET  /api/auth/me       : Get current logged-in user profile (Protected)
 * - GET  /api/auth/users    : List all users (Admin only)
 */

const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  getAllUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (requires valid token)
router.get('/me', protect, getMe);

// Admin-only user management routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
