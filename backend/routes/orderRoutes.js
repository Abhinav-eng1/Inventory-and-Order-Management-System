/**
 * Order Routes
 * 
 * Endpoints:
 * - GET  /api/orders           : Get list of all orders
 * - POST /api/orders           : Create a new order (verifies & reduces stock)
 * - PUT  /api/orders/:id/status: Update order status (restores stock if cancelled)
 */

const express = require('express');
const router = express.Router();
const {
  getOrders,
  createOrder,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

// All order routes require authentication (both admin and staff can view & place orders)
router.use(protect);

router
  .route('/')
  .get(getOrders)
  .post(createOrder);

router
  .route('/:id/status')
  .put(updateOrderStatus);

module.exports = router;
