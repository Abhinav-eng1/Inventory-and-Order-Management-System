/**
 * Order Controller
 * 
 * Handles order operations:
 * - Listing all orders
 * - Creating a new order with automatic stock verification and reduction
 * - Updating order status (Pending / Completed / Cancelled) with automatic stock restoration upon cancellation
 */

const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * @desc    Get all orders
 * @route   GET /api/orders
 * @access  Private (Staff & Admin)
 */
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private (Staff & Admin)
 * 
 * Rules:
 * 1. Verifies that every requested product exists.
 * 2. Checks if there is sufficient stock for each item. If any item has insufficient stock, the entire order is rejected.
 * 3. Reduces stock for each product upon successful order creation.
 */
const createOrder = async (req, res, next) => {
  try {
    const { customerName, items } = req.body;

    // 1. Basic validation
    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a customer name'
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    // 2. Validate products and verify stock availability
    const preparedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const productId = item.productId || item.product;
      const quantity = Number(item.quantity);

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have a valid productId'
        });
      }

      if (!quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Item quantity must be greater than 0'
        });
      }

      // Fetch the product from database
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${productId} does not exist`
        });
      }

      // Check if sufficient stock is available
      if (product.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.quantity}, Requested: ${quantity}`
        });
      }

      // Add to prepared items list with snapshot of current price and name
      preparedItems.push({
        productDoc: product, // Retain document reference to update quantity later
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity
      });

      calculatedTotal += product.price * quantity;
    }

    // 3. Deduct product quantities in inventory
    for (const item of preparedItems) {
      item.productDoc.quantity -= item.quantity;
      await item.productDoc.save();
    }

    // 4. Clean up items array for Order document creation
    const orderItems = preparedItems.map((item) => ({
      product: item.product,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    // 5. Create order in database
    const order = await Order.create({
      customerName: customerName.trim(),
      items: orderItems,
      totalAmount: calculatedTotal,
      status: 'Pending',
      createdBy: req.user ? req.user._id : null
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully and stock updated',
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (Staff & Admin)
 * 
 * Rules:
 * - Allowed statuses: 'Pending', 'Completed', 'Cancelled'
 * - Cancelling an order puts the stock back into inventory.
 * - Re-opening a previously cancelled order verifies stock and re-deducts.
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // 1. Validate status value
    const allowedStatuses = ['Pending', 'Completed', 'Cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(', ')}`
      });
    }

    // 2. Find order
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // If status is identical, no action needed
    if (order.status === status) {
      return res.status(200).json({
        success: true,
        message: `Order status is already "${status}"`,
        order
      });
    }

    const previousStatus = order.status;

    // 3. Stock management when changing status
    // Scenario A: Transitioning TO 'Cancelled' from an active status -> RESTORE STOCK
    if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity += item.quantity;
          await product.save();
        }
      }
    }

    // Scenario B: Transitioning FROM 'Cancelled' back to an active status -> RE-VERIFY & DEDUCT STOCK
    if (previousStatus === 'Cancelled' && status !== 'Cancelled') {
      // First verify all products have sufficient stock
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product || product.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Cannot reopen order: Insufficient stock for "${item.name}".`
          });
        }
      }

      // Deduct stock
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.quantity -= item.quantity;
          await product.save();
        }
      }
    }

    // 4. Update order status and save
    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      success: true,
      message: `Order status updated to "${status}"`,
      order: updatedOrder
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    next(error);
  }
};

module.exports = {
  getOrders,
  createOrder,
  updateOrderStatus
};
