import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { getAuthUser, isUserAdmin } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user || !isUserAdmin(user)) {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = params;
    const { amount } = await req.json();

    if (amount === undefined || amount < 0) {
      return NextResponse.json({ message: 'Valid non-negative amount is required' }, { status: 400 });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ message: 'Complaint not found' }, { status: 404 });
    }

    complaint.amount = Number(amount);
    await complaint.save();

    return NextResponse.json({
      message: 'Service amount updated successfully',
      complaint,
    });
  } catch (error) {
    console.error('Update amount error:', error);
    return NextResponse.json(
      { message: 'Failed to update amount' },
      { status: 500 }
    );
  }
}
