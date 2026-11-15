import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // Full name for display and backward compatibility
    name: {
      type: String,
      required: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
      default: '',
    },
    lastName: {
      type: String,
      trim: true,
      default: '',
    },
    // Email (unique, indexed, lowercase)
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Bcrypt hashed password (optional for Google OAuth accounts)
    passwordHash: {
      type: String,
      default: null,
    },
    // Verification statuses
    emailVerified: {
      type: Boolean,
      default: false,
    },
    mobile: {
      type: String,
      default: '',
      trim: true,
    },
    mobileVerified: {
      type: Boolean,
      default: false,
    },
    // Authentication provider used
    authenticationProvider: {
      type: String,
      enum: ['credentials', 'google'],
      default: 'credentials',
    },
    // Google account ID (sparse unique so null values don't collide)
    googleId: {
      type: String,
      sparse: true,
      unique: true,
      default: null,
    },
    picture: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
