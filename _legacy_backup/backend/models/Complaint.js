/**
 * Complaint Model
 * Stores service complaints/requests from customers
 */

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    // Reference to the user who filed the complaint
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Customer name
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Customer mobile number
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    // Service location
    location: {
      type: String,
      required: true,
      trim: true,
    },
    // Type of service required
    serviceType: {
      type: String,
      required: true,
      enum: [
        'AC Repair',
        'Fridge Repair',
        'Washing Machine Repair',
        'Deep Freezer Repair',
        'Water Cooler Repair',
      ],
    },
    // Customer's preferred service date
    preferredDate: {
      type: Date,
      required: true,
    },
    // Customer's preferred service time
    preferredTime: {
      type: String,
      default: 'Anytime',
    },
    // Any additional instructions from the customer
    instructions: {
      type: String,
      default: '',
      trim: true,
    },
    // Current status of the complaint
    status: {
      type: String,
      enum: ['Pending', 'Called', 'Confirmed', 'On The Way', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    // Admin call tracking
    callStatus: {
      type: String,
      enum: ['Not Called', 'Called'],
      default: 'Not Called',
    },
    // Whether admin has confirmed with the customer
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    // Work completion status (for admin dashboard tabs)
    workStatus: {
      type: String,
      enum: ['Pending', 'Done'],
      default: 'Pending',
    },
    // Technician assignment status
    technicianStatus: {
      type: String,
      enum: ['Not Assigned', 'On The Way'],
      default: 'Not Assigned',
    },
    // Amount charged after technician visit (set by admin)
    amount: {
      type: Number,
      default: 0,
    },
    // Payment status
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    // Coupon applied during payment
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    // Razorpay payment tracking
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    // Cancellation tracking
    cancelledBy: {
      type: String,
      enum: ['Customer', 'Admin', null],
      default: null,
    },
    cancelReason: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
