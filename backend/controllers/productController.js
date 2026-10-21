/**
 * Product Controller
 * 
 * Handles CRUD operations for inventory products:
 * - List all products (Staff & Admin)
 * - Get single product details (Staff & Admin)
 * - Create a product (Admin only)
 * - Update a product (Admin only)
 * - Delete a product (Admin only)
 */

const Product = require('../models/Product');

/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Private (Staff & Admin)
 */
const getProducts = async (req, res, next) => {
  try {
    // Fetch all products from MongoDB, ordered newest first
    const products = await Product.find().sort({ createdAt: -1 });

    // Map through products and attach helper flag 'isLowStock' for easy frontend consumption
    const formattedProducts = products.map((item) => {
      const productObj = item.toObject();
      productObj.isLowStock = item.quantity <= item.lowStockLimit;
      return productObj;
    });

    res.status(200).json({
      success: true,
      count: formattedProducts.length,
      products: formattedProducts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Private (Staff & Admin)
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const productObj = product.toObject();
    productObj.isLowStock = product.quantity <= product.lowStockLimit;

    res.status(200).json({
      success: true,
      product: productObj
    });
  } catch (error) {
    // Check if error is due to an invalid MongoDB ObjectId format
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found (invalid ID format)'
      });
    }
    next(error);
  }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private (Admin only)
 */
const createProduct = async (req, res, next) => {
  try {
    const { name, sku, category, price, quantity, lowStockLimit } = req.body;

    // Validate required fields
    if (!name || !sku || !category || price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, sku, category, price, and quantity'
      });
    }

    // Check if a product with the same SKU already exists
    const skuExists = await Product.findOne({ sku: sku.trim().toUpperCase() });
    if (skuExists) {
      return res.status(400).json({
        success: false,
        message: `A product with SKU "${sku.toUpperCase()}" already exists`
      });
    }

    // Create the product in the database
    const product = await Product.create({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category: category.trim(),
      price: Number(price),
      quantity: Number(quantity),
      lowStockLimit: lowStockLimit !== undefined ? Number(lowStockLimit) : 5
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing product
 * @route   PUT /api/products/:id
 * @access  Private (Admin only)
 */
const updateProduct = async (req, res, next) => {
  try {
    const { name, sku, category, price, quantity, lowStockLimit } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // If SKU is being changed, ensure new SKU isn't already taken by another product
    if (sku && sku.toUpperCase() !== product.sku) {
      const skuExists = await Product.findOne({ sku: sku.trim().toUpperCase() });
      if (skuExists) {
        return res.status(400).json({
          success: false,
          message: `SKU "${sku.toUpperCase()}" is already assigned to another product`
        });
      }
      product.sku = sku.trim().toUpperCase();
    }

    // Update fields if provided
    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (price !== undefined) product.price = Number(price);
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (lowStockLimit !== undefined) product.lowStockLimit = Number(lowStockLimit);

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    next(error);
  }
};

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private (Admin only)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Product "${product.name}" deleted successfully`
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
