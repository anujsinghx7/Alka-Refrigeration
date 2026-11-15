import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VerificationOtp from '@/models/VerificationOtp';
import { createAndSaveOtp } from '@/lib/otpService';
import { sendEmailVerificationOtp } from '@/lib/emailService';
import { sendMobileVerificationOtp } from '@/lib/smsService';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    const { identifier, type } = await req.json();

    if (!identifier || !type) {
      return NextResponse.json(
        { message: 'Identifier and OTP type are required.' },
        { status: 400 }
      );
    }

    const cleanId = identifier.trim().toLowerCase();

    // Find any existing metadata for this identifier and purpose
    const existing = await VerificationOtp.findOne({
      identifier: cleanId,
      type,
    }).sort({ createdAt: -1 });

    const metadata = existing?.metadata || null;

    const otpRes = await createAndSaveOtp({
      identifier: cleanId,
      type,
      metadata,
    });

    if (!otpRes.success) {
      return NextResponse.json({ message: otpRes.message }, { status: 429 });
    }

    // Deliver OTP via appropriate channel
    if (type === 'EMAIL_VERIFICATION' || type === 'PASSWORD_RESET') {
      await sendEmailVerificationOtp({
        email: cleanId,
        name: metadata?.firstName || 'there',
        otp: otpRes.rawOtp,
      });
    } else if (type === 'MOBILE_VERIFICATION') {
      await sendMobileVerificationOtp({
        mobile: cleanId,
        otp: otpRes.rawOtp,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'A new 6-digit verification code has been dispatched.',
      resendAvailableAt: otpRes.resendAvailableAt,
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json(
      { message: 'Failed to resend verification code.', error: error.message },
      { status: 500 }
    );
  }
}
