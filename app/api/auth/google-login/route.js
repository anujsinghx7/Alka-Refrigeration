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
      user.name = name || user.name;
      user.picture = picture || user.picture;
      if (role === 'admin') user.role = 'admin';
      user.emailVerified = true;
      await user.save();
    } else {
      // Check if user with this email already exists (e.g. registered via email/password)
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        user.googleId = googleId;
        if (!user.picture) user.picture = picture;
        if (role === 'admin') user.role = 'admin';
        user.emailVerified = true;
        await user.save();
      } else {
        const nameParts = (name || '').trim().split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';

        user = await User.create({
          googleId,
          name,
          firstName,
          lastName,
          email: email.toLowerCase(),
          picture,
          role,
          emailVerified: true,
          authenticationProvider: 'google',
        });
      }
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
