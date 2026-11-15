import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const complaints = await Complaint.find({ userId: user._id })
      .populate('couponApplied', 'code discountType discountValue discount')
      .sort({ createdAt: -1 });

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error('Get user complaints error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}
