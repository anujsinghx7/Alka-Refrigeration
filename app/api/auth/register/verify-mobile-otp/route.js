import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyMobileOtpSchema } from '@/schemas/authSchemas';
import { verifyOtp } from '@/lib/otpService';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const parseResult = verifyMobileOtpSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: parseResult.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { email, mobile, otp } = parseResult.data;

    // Verify SMS OTP
    const verification = await verifyOtp({
      identifier: mobile,
      type: 'MOBILE_VERIFICATION',
      candidateOtp: otp,
    });

    if (!verification.valid) {
      return NextResponse.json({ message: verification.message }, { status: 400 });
    }

    // Update user record with verified mobile
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    user.mobile = mobile;
    user.mobileVerified = true;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Mobile number verified successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        mobile: user.mobile,
        mobileVerified: user.mobileVerified,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Verify Mobile OTP error:', error);
    return NextResponse.json(
      { message: 'Failed to verify mobile code.', error: error.message },
      { status: 500 }
    );
  }
}
