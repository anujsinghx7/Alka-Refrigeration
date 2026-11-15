import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import User from '@/models/User';
import { getAuthUser, isUserAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || !isUserAdmin(user)) {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const [totalComplaints, pendingComplaints, completedComplaints, totalCustomers, totalRevenue] =
      await Promise.all([
        Complaint.countDocuments(),
        Complaint.countDocuments({ workStatus: 'Pending' }),
        Complaint.countDocuments({ workStatus: 'Done' }),
        User.countDocuments({ role: { $ne: 'admin' } }),
        Complaint.aggregate([
          { $match: { paymentStatus: 'Paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

    return NextResponse.json({
      stats: {
        totalComplaints,
        pendingComplaints,
        completedComplaints,
        totalCustomers,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
