import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { getAuthUser, isUserAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || !isUserAdmin(user)) {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const workStatus = searchParams.get('workStatus');
    const filter = {};

    if (workStatus && ['Pending', 'Done'].includes(workStatus)) {
      filter.workStatus = workStatus;
    }

    const complaints = await Complaint.find(filter)
      .populate('userId', 'name email mobile picture')
      .populate('couponApplied', 'code discountType discountValue discount')
      .sort({ createdAt: -1 });

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Admin get complaints error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}
