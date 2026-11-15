import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { getAuthUser, isUserAdmin } from '@/lib/auth';
import { couponSchema } from '@/schemas/couponSchema';

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || !isUserAdmin(user)) {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = couponSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { message: parseResult.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      );
    }

    const { code, discountType, discountValue, serviceType, expiryDate, description, userId } =
      parseResult.data;

    const discount = discountType === 'Percentage' ? discountValue : 100;

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      userId: userId || null,
      discount,
      discountType,
      discountValue,
      serviceType: serviceType || 'All Services',
      expiryDate: new Date(expiryDate),
      description: description || '',
      isActive: true,
      isUsed: false,
    });

    return NextResponse.json(
      { message: 'Coupon created successfully', coupon },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Coupon code already exists' }, { status: 400 });
    }
    console.error('Create coupon error:', error);
    return NextResponse.json(
      { message: 'Failed to create coupon' },
      { status: 500 }
    );
  }
}
