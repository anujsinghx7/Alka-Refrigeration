import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { registerStep1Schema } from '@/schemas/authSchemas';
import { createAndSaveOtp } from '@/lib/otpService';
import { sendEmailVerificationOtp } from '@/lib/emailService';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const parseResult = registerStep1Schema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ message: errorMsg }, { status: 400 });
    }

    const { firstName, lastName, email, password } = parseResult.data;

    // Check if an active verified user already exists with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      if (existingUser.emailVerified || existingUser.googleId) {
        return NextResponse.json(
          {
            message:
              'An account with this email address already exists. Please sign in or use password recovery.',
          },
          { status: 409 }
        );
      }
    }

    // Hash password with strong salt rounds (12)
    const passwordHash = await bcrypt.hash(password, 12);
    const fullName = `${firstName} ${lastName}`.trim();

    // Create and save hashed OTP with registration metadata
    const otpRes = await createAndSaveOtp({
      identifier: email,
      type: 'EMAIL_VERIFICATION',
      metadata: {
        firstName,
        lastName,
        name: fullName,
        email,
        passwordHash,
      },
    });

    if (!otpRes.success) {
      return NextResponse.json({ message: otpRes.message }, { status: 429 });
    }

    // Send email with OTP code
    await sendEmailVerificationOtp({
      email,
      name: firstName,
      otp: otpRes.rawOtp,
    });

    return NextResponse.json(
      {
        success: true,
        email,
        resendAvailableAt: otpRes.resendAvailableAt,
        message: 'A 6-digit verification code has been sent to your email.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Register Step 1 error:', error);
    return NextResponse.json(
      { message: 'Failed to process registration. Please try again.', error: error.message },
      { status: 500 }
    );
  }
}
