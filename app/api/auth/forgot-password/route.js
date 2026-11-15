import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { forgotPasswordSchema } from '@/schemas/authSchemas';
import { createAndSaveOtp } from '@/lib/otpService';
import { sendPasswordResetOtp } from '@/lib/emailService';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const parseResult = forgotPasswordSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: parseResult.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { email } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });

    // Consistent response message to protect against account enumeration
    const genericSuccessMessage =
      'If an account is associated with this email, a 6-digit password reset code has been dispatched.';

    if (!user) {
      return NextResponse.json({ success: true, message: genericSuccessMessage });
    }

    // Generate, hash, and store password reset OTP
    const otpRes = await createAndSaveOtp({
      identifier: cleanEmail,
      type: 'PASSWORD_RESET',
      metadata: { userId: user._id.toString(), email: cleanEmail },
    });

    if (!otpRes.success) {
      return NextResponse.json({ message: otpRes.message }, { status: 429 });
    }

    // Send email with reset code
    await sendPasswordResetOtp({
      email: cleanEmail,
      name: user.name || user.firstName,
      otp: otpRes.rawOtp,
    });

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      resendAvailableAt: otpRes.resendAvailableAt,
      message: genericSuccessMessage,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Failed to process password recovery.', error: error.message },
      { status: 500 }
    );
  }
}
