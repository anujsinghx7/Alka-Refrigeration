import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const coupons = await Coupon.find({
      $or: [{ userId: user._id }, { userId: null }],
      isActive: true,
      expiryDate: { $gte: now },
      isUsed: false,
    }).sort({ createdAt: -1 });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Get user coupons error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user coupons' },
      { status: 500 }
    );
  }
}
