import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import User from '@/models/User';
import { getAuthUser, isUserAdmin } from '@/lib/auth';

export async function POST(req) {
  try {
    await connectDB();
    const admin = await getAuthUser(req);
    if (!admin || !isUserAdmin(admin)) {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { code, discountType, discountValue, serviceType, expiryDate, description, userId } =
      await req.json();

    if (!userId || !code || !discountValue || !expiryDate) {
      return NextResponse.json(
        { message: 'userId, code, discount value, and expiry date are required' },
        { status: 400 }
      );
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ message: 'Target user not found' }, { status: 404 });
    }

    const discount = discountType === 'Percentage' ? discountValue : 100;

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      userId,
      discount,
      discountType: discountType || 'Percentage',
      discountValue,
      serviceType: serviceType || 'All Services',
      expiryDate: new Date(expiryDate),
      description: description || `Special exclusive coupon for ${targetUser.name}`,
      isActive: true,
      isUsed: false,
    });

    return NextResponse.json(
      { message: `Coupon sent to ${targetUser.name}`, coupon },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Coupon code already exists' }, { status: 400 });
    }
    console.error('Send coupon error:', error);
    return NextResponse.json(
      { message: 'Failed to send coupon' },
      { status: 500 }
    );
  }
}
