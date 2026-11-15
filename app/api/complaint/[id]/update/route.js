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
    const { mobile, location, preferredDate, preferredTime, instructions } = await req.json();

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ message: 'Complaint not found' }, { status: 404 });
    }

    if (complaint.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ message: 'Not authorized to edit this booking' }, { status: 403 });
    }

    if (complaint.isConfirmed) {
      return NextResponse.json(
        { message: 'Booking is confirmed by admin. Cannot edit online.' },
        { status: 400 }
      );
    }

    if (['Cancelled', 'Completed'].includes(complaint.status)) {
      return NextResponse.json(
        { message: `Cannot edit a booking with status: ${complaint.status}` },
        { status: 400 }
      );
    }

    if (mobile) complaint.mobile = mobile;
    if (location) complaint.location = location;
    if (preferredDate) complaint.preferredDate = new Date(preferredDate);
    if (preferredTime) complaint.preferredTime = preferredTime;
    if (instructions !== undefined) complaint.instructions = instructions;

    await complaint.save();

    return NextResponse.json({
      message: 'Booking updated successfully',
      complaint,
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    return NextResponse.json(
      { message: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
