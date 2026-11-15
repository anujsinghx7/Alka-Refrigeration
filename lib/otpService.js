import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import connectDB from './mongodb';
import VerificationOtp from '@/models/VerificationOtp';

const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

/**
 * Generates a cryptographically secure 6-digit numeric OTP string
 */
export function generateNumericOtp() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Creates, hashes, and stores an OTP record in MongoDB
 */
export async function createAndSaveOtp({ identifier, type, metadata = null }) {
  await connectDB();
  const cleanId = identifier.trim().toLowerCase();

  // Check if an existing OTP is still within the resend cooldown
  const existingOtp = await VerificationOtp.findOne({
    identifier: cleanId,
    type,
    resendAvailableAt: { $gt: new Date() },
  });

  if (existingOtp) {
    const waitSeconds = Math.ceil((existingOtp.resendAvailableAt.getTime() - Date.now()) / 1000);
    return {
      success: false,
      cooldown: true,
      waitSeconds,
      message: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
    };
  }

  // Invalidate any older OTPs for this identifier and purpose
  await VerificationOtp.deleteMany({ identifier: cleanId, type });

  // Generate plain 6-digit OTP
  const rawOtp = generateNumericOtp();

  // Hash the OTP with bcrypt (salt rounds = 10)
  const hashedOtp = await bcrypt.hash(rawOtp, 10);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  const resendAvailableAt = new Date(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);

  const otpDoc = await VerificationOtp.create({
    identifier: cleanId,
    hashedOtp,
    type,
    expiresAt,
    resendAvailableAt,
    metadata,
  });

  return {
    success: true,
    rawOtp, // Returned only for delivery via Email/SMS service, never sent to client!
    expiresAt,
    resendAvailableAt,
    otpId: otpDoc._id,
  };
}

/**
 * Verifies a submitted OTP against the database record
 */
export async function verifyOtp({ identifier, type, candidateOtp }) {
  await connectDB();
  const cleanId = identifier.trim().toLowerCase();

  const record = await VerificationOtp.findOne({
    identifier: cleanId,
    type,
  }).sort({ createdAt: -1 });

  if (!record) {
    return {
      valid: false,
      message: 'No active OTP found. Please request a new verification code.',
    };
  }

  // Check expiration
  if (new Date() > record.expiresAt) {
    await VerificationOtp.deleteOne({ _id: record._id });
    return {
      valid: false,
      expired: true,
      message: 'Verification code has expired. Please request a new code.',
    };
  }

  // Check attempt limit
  if (record.attempts >= MAX_ATTEMPTS) {
    await VerificationOtp.deleteOne({ _id: record._id });
    return {
      valid: false,
      tooManyAttempts: true,
      message: 'Too many incorrect attempts. This code has been invalidated. Please request a new one.',
    };
  }

  // Compare candidate OTP with stored bcrypt hash
  const isMatch = await bcrypt.compare(candidateOtp.trim(), record.hashedOtp);

  if (!isMatch) {
    record.attempts += 1;
    await record.save();
    const remaining = MAX_ATTEMPTS - record.attempts;
    return {
      valid: false,
      message: `Invalid code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    };
  }

  // Match found! Retrieve metadata and delete OTP record (single-use enforcement)
  const metadata = record.metadata;
  await VerificationOtp.deleteOne({ _id: record._id });

  return {
    valid: true,
    metadata,
    message: 'Code verified successfully.',
  };
}
