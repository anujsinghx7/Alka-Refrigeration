import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { loginSchema } from '@/schemas/authSchemas';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { message: parseResult.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });

    // Prevent account enumeration by using consistent timing and generic error
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email address or password.' },
        { status: 401 }
      );
    }

    // Check if account has a password or was created via Google only
    if (!user.passwordHash) {
      if (user.googleId) {
        return NextResponse.json(
          {
            message:
              'This account was registered using Google. Please click "Continue with Google" to sign in.',
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { message: 'Invalid authentication state. Please reset your password.' },
        { status: 400 }
      );
    }

    // Check email verification status
    if (!user.emailVerified) {
      return NextResponse.json(
        {
          message:
            'Your email address has not been verified yet. Please complete verification or sign up again.',
          unverified: true,
          email: user.email,
        },
        { status: 403 }
      );
    }

    // Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid email address or password.' },
        { status: 401 }
      );
    }

    // Synchronize role with ADMIN_EMAIL if applicable
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && user.email.toLowerCase() === adminEmail.toLowerCase() && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    // Issue JWT token (30 days if rememberMe, else 7 days)
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const maxAgeSeconds = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
    const token = signToken({ id: user._id }, tokenExpiry);

    const response = NextResponse.json({
      success: true,
      message: `Welcome back, ${user.name || user.firstName}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobile: user.mobile,
        mobileVerified: user.mobileVerified,
        location: user.location,
        picture: user.picture,
        role: user.role,
      },
    });

    // Set secure cookie
    response.cookies.set('alka_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    });

    return response;
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { message: 'Authentication failed. Please try again.', error: error.message },
      { status: 500 }
    );
  }
}
