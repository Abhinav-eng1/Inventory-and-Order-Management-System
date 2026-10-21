/**
 * User Model
 * 
 * Defines the structure for user accounts in MongoDB.
 * Includes password hashing before saving and a helper method
 * to compare passwords during login.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Full name of the user
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    // Unique email address used for login
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    // Password (stored securely as a hash, never as plain text)
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    // User role: either "admin" or "staff"
    role: {
      type: String,
      enum: {
        values: ['admin', 'staff'],
        message: '{VALUE} is not a valid role. Allowed roles: admin, staff'
      },
      default: 'staff'
    }
  },
  {
    // Automatically creates 'createdAt' and 'updatedAt' timestamps
    timestamps: true
  }
);

/**
 * Pre-save Middleware Hook
 * Automatically hashes the user's password using bcrypt before saving to the database.
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt with cost factor 10
    const salt = await bcrypt.genSalt(10);
    // Hash the plain text password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance Method: matchPassword
 * Compares the entered plain-text password with the hashed password stored in the database.
 * Returns true if passwords match, false otherwise.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
