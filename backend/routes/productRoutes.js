/**
 * Product Routes
 * 
 * Endpoints:
 * - GET    /api/products      : List all products (Staff & Admin)
 * - POST   /api/products      : Create new product (Admin only)
 * - GET    /api/products/:id  : Get single product details (Staff & Admin)
 * - PUT    /api/products/:id  : Update product (Admin only)
 * - DELETE /api/products/:id  : Delete product (Admin only)
 */

const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Route: /api/products
router
  .route('/')
  .get(protect, getProducts)
  .post(protect, authorize('admin'), createProduct);

// Route: /api/products/:id
router
  .route('/:id')
  .get(protect, getProductById)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
