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
    const { status, callStatus, workStatus, technicianStatus } = await req.json();

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ message: 'Complaint not found' }, { status: 404 });
    }

    if (status) complaint.status = status;
    if (callStatus) {
      complaint.callStatus = callStatus;
      if (callStatus === 'Called' && complaint.status === 'Pending') {
        complaint.status = 'Called';
      }
    }
    if (workStatus) {
      complaint.workStatus = workStatus;
      if (workStatus === 'Done') complaint.status = 'Completed';
    }
    if (technicianStatus) {
      complaint.technicianStatus = technicianStatus;
      if (technicianStatus === 'On The Way') complaint.status = 'On The Way';
    }

    await complaint.save();

    const updated = await Complaint.findById(id)
      .populate('userId', 'name email mobile picture')
      .populate('couponApplied', 'code discountType discountValue discount');

    // Emit real-time WebSocket update after successful DB persistence
    try {
      emitBookingStatusUpdate(updated || complaint);
    } catch (socketErr) {
      console.error('Socket.IO emit error:', socketErr);
    }

    return NextResponse.json({
      message: 'Complaint status updated successfully',
      complaint: updated,
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    return NextResponse.json(
      { message: 'Failed to update complaint status' },
      { status: 500 }
    );
  }
}
