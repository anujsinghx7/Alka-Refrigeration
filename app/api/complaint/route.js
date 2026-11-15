import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { getAuthUser } from '@/lib/auth';
import { bookingSchema } from '@/schemas/bookingSchema';

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);

    if (!user) {
      return NextResponse.json(
        { message: 'Please login to submit a service booking' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parseResult = bookingSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ message: errorMsg }, { status: 400 });
    }

    const { name, mobile, location, serviceType, preferredDate, preferredTime, instructions } =
      parseResult.data;

    const complaint = await Complaint.create({
      userId: user._id,
      name,
      mobile,
      location,
      serviceType,
      preferredDate: new Date(preferredDate),
      preferredTime: preferredTime || 'Anytime',
      instructions: instructions || '',
    });

    // Also update customer profile with phone and location if empty
    let updatedProfile = false;
    if (!user.mobile && mobile) {
      user.mobile = mobile;
      updatedProfile = true;
    }
    if (!user.location && location) {
      user.location = location;
      updatedProfile = true;
    }
    if (updatedProfile) {
      await user.save();
    }

    return NextResponse.json(
      {
        message: 'Complaint registered successfully! We will contact you shortly.',
        complaint,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create complaint error:', error);
    return NextResponse.json(
      { message: 'Failed to register complaint', error: error.message },
      { status: 500 }
    );
  }
}
