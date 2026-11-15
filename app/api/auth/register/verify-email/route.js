import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyEmailOtpSchema } from '@/schemas/authSchemas';
import { verifyOtp } from '@/lib/otpService';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const parseResult = verifyEmailOtpSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: parseResult.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { email, otp } = parseResult.data;

    // Verify OTP against hashed record
    const verification = await verifyOtp({
      identifier: email,
      type: 'EMAIL_VERIFICATION',
      candidateOtp: otp,
    });

    if (!verification.valid) {
      return NextResponse.json({ message: verification.message }, { status: 400 });
    }

    const meta = verification.metadata;
    if (!meta || !meta.passwordHash) {
      return NextResponse.json(
        { message: 'Registration session expired. Please start registration again.' },
        { status: 400 }
      );
    }

    // Role check against ADMIN_EMAIL
    const adminEmail = process.env.ADMIN_EMAIL;
    const role =
      adminEmail && email.toLowerCase() === adminEmail.toLowerCase() ? 'admin' : 'user';

    // Upsert or create user record
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      user.firstName = meta.firstName;
      user.lastName = meta.lastName;
      user.name = meta.name;
      user.passwordHash = meta.passwordHash;
      user.emailVerified = true;
      user.authenticationProvider = 'credentials';
      user.role = role;
      await user.save();
    } else {
      user = await User.create({
        firstName: meta.firstName,
        lastName: meta.lastName,
        name: meta.name,
        email: email.toLowerCase(),
        passwordHash: meta.passwordHash,
        emailVerified: true,
        authenticationProvider: 'credentials',
        role,
      });
    }

    // Issue JWT token so user can optionally verify phone or finish registration
    const token = signToken({ id: user._id });

    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.emailVerified,
        mobile: user.mobile,
        mobileVerified: user.mobileVerified,
        role: user.role,
      },
    });

    // Set secure cookie
    response.cookies.set('alka_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Verify Email error:', error);
    return NextResponse.json(
      { message: 'Failed to verify email code.', error: error.message },
      { status: 500 }
    );
  }
}
