/**
 * Coupon Model
 * Stores discount coupons and special offers
 */

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    // Coupon code for display
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    // Target user (null = global coupon available to all)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Legacy discount percentage (kept for backward compatibility)
    discount: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    // Discount type: Flat (₹) or Percentage (%)
    discountType: {
      type: String,
      enum: ['Flat', 'Percentage'],
      default: 'Percentage',
    },
    // Discount value (amount in ₹ or percentage)
    discountValue: {
      type: Number,
      default: 0,
    },
    // Applicable service type (null = all services)
    serviceType: {
      type: String,
      enum: [
        'AC Repair',
        'Fridge Repair',
        'Washing Machine Repair',
        'Deep Freezer Repair',
        'Water Cooler Repair',
        'All Services',
      ],
      default: 'All Services',
    },
    // Description of the offer
    description: {
      type: String,
      default: '',
      trim: true,
    },
    // Coupon expiry date
    expiryDate: {
      type: Date,
      required: true,
    },
    // Whether the coupon is currently active
    isActive: {
      type: Boolean,
      default: true,
    },
    // Whether the coupon has been used
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Coupon', couponSchema);
