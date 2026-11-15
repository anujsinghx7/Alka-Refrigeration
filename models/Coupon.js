import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    discount: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    discountType: {
      type: String,
      enum: ['Flat', 'Percentage'],
      default: 'Percentage',
    },
    discountValue: {
      type: Number,
      default: 0,
    },
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
    description: {
      type: String,
      default: '',
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
