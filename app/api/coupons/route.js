import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

// Force dynamic execution for coupons
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: now },
    }).sort({ discountValue: -1, discount: -1 });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Get active coupons error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}
