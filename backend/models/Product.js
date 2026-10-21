/**
 * Product Model
 * 
 * Defines the schema for inventory products.
 * Fields:
 * - name: Name of the product (e.g., "Wireless Mouse")
 * - sku: Stock Keeping Unit (unique identifier code, e.g., "MOU-001")
 * - category: Category of the item (e.g., "Electronics")
 * - price: Unit price of the product
 * - quantity: Current stock on hand
 * - lowStockLimit: Threshold below which a "Low stock" badge is shown
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true
    },
    sku: {
      type: String,
      required: [true, 'Please provide a unique SKU code'],
      unique: true,
      trim: true,
      uppercase: true
    },
    category: {
      type: String,
      required: [true, 'Please provide a product category'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Please provide a valid price'],
      min: [0, 'Price cannot be negative']
    },
    quantity: {
      type: Number,
      required: [true, 'Please provide available stock quantity'],
      min: [0, 'Quantity cannot be negative'],
      default: 0
    },
    lowStockLimit: {
      type: Number,
      required: [true, 'Please provide a low stock threshold limit'],
      min: [0, 'Low stock limit cannot be negative'],
      default: 5
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
