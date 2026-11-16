import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { getAuthUser, isUserAdmin } from '@/lib/auth';
import { emitBookingStatusUpdate } from '@/lib/socketServer';

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || !isUserAdmin(user)) {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ message: 'Complaint not found' }, { status: 404 });
    }

    complaint.isConfirmed = true;
    complaint.callStatus = 'Called';
    complaint.status = 'Confirmed';

    await complaint.save();

    const updated = await Complaint.findById(id).populate(
      'userId',
      'name email mobile picture'
    );

    // Emit real-time status update
    try {
      emitBookingStatusUpdate(updated || complaint);
    } catch (socketErr) {
      console.error('Socket.IO emit error:', socketErr);
    }

    return NextResponse.json({
      message: 'Complaint confirmed by admin',
      complaint: updated,
    });
  } catch (error) {
    console.error('Confirm complaint error:', error);
    return NextResponse.json(
      { message: 'Failed to confirm complaint' },
      { status: 500 }
    );
  }
}
