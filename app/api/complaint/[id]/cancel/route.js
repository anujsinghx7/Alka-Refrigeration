import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { getAuthUser } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const reason = body?.reason || 'Cancelled by customer';

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ message: 'Complaint not found' }, { status: 404 });
    }

    if (complaint.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ message: 'Not authorized to cancel this booking' }, { status: 403 });
    }

    if (complaint.isConfirmed) {
      return NextResponse.json(
        { message: 'Booking is confirmed by admin. Cannot cancel online.' },
        { status: 400 }
      );
    }

    if (complaint.status === 'Cancelled') {
      return NextResponse.json({ message: 'Booking is already cancelled' }, { status: 400 });
    }

    complaint.status = 'Cancelled';
    complaint.cancelledBy = 'Customer';
    complaint.cancelReason = reason;

    await complaint.save();

    return NextResponse.json({
      message: 'Booking cancelled successfully',
      complaint,
    });
  } catch (error) {
    console.error('Cancel complaint error:', error);
    return NextResponse.json(
      { message: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
