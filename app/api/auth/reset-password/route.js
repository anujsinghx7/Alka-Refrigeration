import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { resetPasswordSchema } from '@/schemas/authSchemas';
import { verifyOtp } from '@/lib/otpService';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const parseResult = resetPasswordSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: parseResult.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { email, otp, newPassword } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    // Verify OTP
    const verification = await verifyOtp({
      identifier: cleanEmail,
      type: 'PASSWORD_RESET',
      candidateOtp: otp,
    });

    if (!verification.valid) {
      return NextResponse.json({ message: verification.message }, { status: 400 });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return NextResponse.json({ message: 'User account not found.' }, { status: 404 });
    }

    user.passwordHash = passwordHash;
    // Mark email as verified if resetting password
    user.emailVerified = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password reset successful! You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Failed to reset password.', error: error.message },
      { status: 500 }
    );
  }
}
