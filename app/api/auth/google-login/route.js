import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req) {
  try {
    await connectDB();
    const { credential } = await req.json();

    if (!credential) {
      return NextResponse.json(
        { message: 'Google credential is required' },
        { status: 400 }
      );
    }

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture } = payload;

    // Check if email matches admin email
    const adminEmail = process.env.ADMIN_EMAIL;
    const role =
      adminEmail && email.toLowerCase() === adminEmail.toLowerCase()
        ? 'admin'
        : 'user';

    let user = await User.findOne({ googleId });
    if (user) {
      user.name = name;
      user.picture = picture;
      user.role = role;
      await user.save();
    } else {
      user = await User.create({
        googleId,
        name,
        email,
        picture,
        role,
      });
    }

    const token = signToken({ id: user._id });

    const response = NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        location: user.location,
        picture: user.picture,
        role: user.role,
      },
    });

    // Set secure cookie for Server Components & Actions
    response.cookies.set('alka_token', token, {
      httpOnly: false, // Accessible to client auth sync
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('API Google login error:', error);
    return NextResponse.json(
      { message: 'Authentication failed', error: error.message },
      { status: 500 }
    );
  }
}
