import mongoose from 'mongoose';
import './User';
import './Coupon';

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
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
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTime: {
      type: String,
      default: 'Anytime',
    },
    instructions: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Called', 'Confirmed', 'On The Way', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    callStatus: {
      type: String,
      enum: ['Not Called', 'Called'],
      default: 'Not Called',
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    workStatus: {
      type: String,
      enum: ['Pending', 'Done'],
      default: 'Pending',
    },
    technicianStatus: {
      type: String,
      enum: ['Not Assigned', 'On The Way'],
      default: 'Not Assigned',
    },
    amount: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
    couponApplied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
      default: null,
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
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

export default mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
