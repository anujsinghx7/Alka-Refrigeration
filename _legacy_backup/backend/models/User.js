/**
 * User Model
 * Stores user information from Google OAuth login
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Google account ID for unique identification
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    // User's full name from Google profile
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Email address from Google profile
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Mobile number (user can add/update later)
    mobile: {
      type: String,
      default: '',
    },
    // Location (auto-detected or manually entered)
    location: {
      type: String,
      default: '',
    },
    // Profile picture URL from Google
    picture: {
      type: String,
      default: '',
    },
    // User role for access control
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('User', userSchema);
