/**
 * Dashboard Controller
 * 
 * Aggregates summary statistics for the inventory dashboard:
 * - Total products count
 * - Total orders count
 * - Low-stock items count (products where quantity <= lowStockLimit)
 * - Total sales value (revenue from completed orders)
 * - Also provides recent orders and list of low-stock products for quick action
 */

const Product = require('../models/Product');
const Order = require('../models/Order');

/**
 * @desc    Get dashboard summary statistics
 * @route   GET /api/dashboard
 * @access  Private (Staff & Admin)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Total count of products
    const totalProducts = await Product.countDocuments();

    // 2. Total count of orders
    const totalOrders = await Order.countDocuments();

    // 3. Count products where quantity is at or below the lowStockLimit
    // Uses MongoDB aggregation with $expr to compare two fields in the same document
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$lowStockLimit'] }
    }).sort({ quantity: 1 });

    const lowStockCount = lowStockProducts.length;

    // 4. Calculate total sales value
    // Sum the totalAmount of orders that are 'Completed' (or non-cancelled)
    const salesAggregation = await Order.aggregate([
      {
        $match: {
          status: { $in: ['Completed', 'Pending'] } // Revenue from valid orders
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' }
        }
      }
    ]);

    const totalSalesValue = salesAggregation.length > 0 ? salesAggregation[0].totalSales : 0;

    // 5. Fetch 5 most recent orders for dashboard table
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        lowStockCount,
        totalSalesValue,
        lowStockProducts: lowStockProducts.slice(0, 5), // top 5 low stock products
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
