import mongoose from 'mongoose';

const verificationOtpSchema = new mongoose.Schema(
  {
    // Email or mobile number
    identifier: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    // Bcrypt-hashed 6-digit OTP (never plaintext)
    hashedOtp: {
      type: String,
      required: true,
    },
    // Purpose of the OTP
    type: {
      type: String,
      enum: ['EMAIL_VERIFICATION', 'MOBILE_VERIFICATION', 'PASSWORD_RESET'],
      required: true,
      index: true,
    },
    // Expiration timestamp (e.g. 5 minutes from generation)
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    // Verification attempt counter (max 5 attempts before invalidation)
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Cooldown timestamp before another OTP request is permitted
    resendAvailableAt: {
      type: Date,
      required: true,
    },
    // Temporary payload storage for unconfirmed registrations
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// MongoDB TTL Index: documents automatically purged after 15 minutes
verificationOtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 900 });

export default mongoose.models.VerificationOtp ||
  mongoose.model('VerificationOtp', verificationOtpSchema);
