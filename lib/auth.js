import jwt from 'jsonwebtoken';
import { headers, cookies } from 'next/headers';
import connectDB from './mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'alka123secret';

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Extracts and verifies auth token from Request headers, cookies, or next/headers
 */
export async function getAuthUser(req) {
  await connectDB();
  let token = null;

  // Try extracting from NextRequest authorization header
  if (req && req.headers) {
    const authHeader = req.headers.get ? req.headers.get('authorization') : req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  // If not in request header, try cookies
  if (!token) {
    try {
      const cookieStore = cookies();
      const cookieToken = cookieStore.get('alka_token');
      if (cookieToken) {
        token = cookieToken.value;
      }
    } catch {
      // In contexts where cookies() is not available
    }
  }

  // If still not found and req has cookies
  if (!token && req && req.cookies) {
    if (typeof req.cookies.get === 'function') {
      const c = req.cookies.get('alka_token');
      if (c) token = c.value;
    } else if (req.cookies.alka_token) {
      token = req.cookies.alka_token;
    }
  }

  if (!token) {
    return null;
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.id) {
    return null;
  }

  const user = await User.findById(decoded.id).select('-__v');
  return user;
}

/**
 * Validates if the authenticated user is an admin
 */
export function isUserAdmin(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && user.email && user.email.toLowerCase() === adminEmail.toLowerCase()) {
    return true;
  }
  return false;
}
