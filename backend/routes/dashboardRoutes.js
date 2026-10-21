/**
 * Dashboard Routes
 * 
 * Endpoint:
 * - GET /api/dashboard : Retrieve aggregated inventory and order statistics
 */

const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Dashboard metrics are viewable by all authenticated users (Staff and Admin)
router.get('/', protect, getDashboardStats);

module.exports = router;
