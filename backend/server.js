/**
 * Main Server Entry Point
 * 
 * Sets up the Express server, connects to MongoDB, mounts REST API routes,
 * and attaches global error handling middleware.
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Import custom error middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB database
connectDB();

// Initialize the Express application
const app = express();

// Enable Cross-Origin Resource Sharing (CORS) so frontend can communicate with backend
app.use(cors());

// Middleware to parse incoming JSON request bodies
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Inventory and Order Management System API',
    status: 'Running',
    version: '1.0.0'
  });
});

// Mount API routes under /api
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Catch 404 routes and forward to error handler
app.use(notFound);

// Central error handler
app.use(errorHandler);

// Define PORT (defaults to 5000 if not specified in .env)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
