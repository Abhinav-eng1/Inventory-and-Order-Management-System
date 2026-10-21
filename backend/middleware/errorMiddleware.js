/**
 * Error Handling Middleware
 * 
 * Provides centralized error handling so routes can forward errors
 * using next(error) instead of manually constructing error responses.
 */

// Middleware to catch requests to routes that do not exist (404)
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handling middleware for catching all unhandled or forwarded errors
const errorHandler = (err, req, res, next) => {
  // If the status code was still 200, default it to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    // Only show stack trace in development mode for debugging
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = {
  notFound,
  errorHandler
};
