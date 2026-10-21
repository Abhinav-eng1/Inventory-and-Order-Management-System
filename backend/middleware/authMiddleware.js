/**
 * Authentication & Authorization Middleware
 * 
 * - `protect`: Verifies the JSON Web Token (JWT) sent in the request header.
 * - `authorize`: Checks if the authenticated user has the required role (e.g. 'admin').
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect Middleware
 * Ensures the incoming request has a valid Bearer token in the Authorization header.
 * Attaches the user object to `req.user` if valid.
 */
const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from 'Bearer <token>'
      token = req.headers.authorization.split(' ')[1];

      // Verify token signature against JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID in database, exclude password field from the result
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists. Authorization denied.'
        });
      }

      // Proceed to the next middleware or controller
      next();
    } catch (error) {
      console.error('JWT verification error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired'
      });
    }
  }

  // If no token was found in the header
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
};

/**
 * Authorize Middleware
 * Restricts access to specific user roles (e.g., 'admin').
 * Must be used AFTER the `protect` middleware because it requires `req.user`.
 * 
 * Usage: authorize('admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is included in the allowed roles
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
