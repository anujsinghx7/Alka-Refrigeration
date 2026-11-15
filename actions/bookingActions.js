'use server';

import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import { getAuthUser } from '@/lib/auth';
import { bookingSchema } from '@/schemas/bookingSchema';

/**
 * Server Action for submitting a booking request
 * Demonstrates: Next.js Server Actions, Server Validation (Zod), Cache Revalidation
 */
export async function createBookingAction(formData) {
  try {
    await connectDB();
    const user = await getAuthUser();

    if (!user) {
      return { success: false, message: 'Please sign in with Google first.' };
    }

    const rawData = {
      name: formData.get('name'),
      mobile: formData.get('mobile'),
      location: formData.get('location'),
      serviceType: formData.get('serviceType'),
      preferredDate: formData.get('preferredDate'),
      preferredTime: formData.get('preferredTime') || 'Anytime',
      instructions: formData.get('instructions') || '',
    };

    const validation = bookingSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        message: validation.error.errors.map((e) => e.message).join(', '),
      };
    }

    const { name, mobile, location, serviceType, preferredDate, preferredTime, instructions } =
      validation.data;

    const complaint = await Complaint.create({
      userId: user._id,
      name,
      mobile,
      location,
      serviceType,
      preferredDate: new Date(preferredDate),
      preferredTime,
      instructions,
    });

    if (!user.mobile && mobile) {
      user.mobile = mobile;
      await user.save();
    }
    if (!user.location && location) {
      user.location = location;
      await user.save();
    }

    revalidatePath('/profile');
    revalidatePath('/admin');

    return {
      success: true,
      message: 'Booking submitted successfully! Our expert technician will call you shortly.',
      bookingId: complaint._id.toString(),
    };
  } catch (error) {
    console.error('Server Action createBookingAction error:', error);
    return { success: false, message: error.message || 'Failed to submit booking.' };
  }
}

/**
 * Server Action for updating a booking
 */
export async function updateBookingAction(id, data) {
  try {
    await connectDB();
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const complaint = await Complaint.findById(id);
    if (!complaint) return { success: false, message: 'Booking not found' };

    if (complaint.userId.toString() !== user._id.toString()) {
      return { success: false, message: 'Forbidden' };
    }

    if (complaint.isConfirmed) {
      return { success: false, message: 'Booking is already confirmed by admin.' };
    }

    if (data.mobile) complaint.mobile = data.mobile;
    if (data.location) complaint.location = data.location;
    if (data.preferredDate) complaint.preferredDate = new Date(data.preferredDate);
    if (data.preferredTime) complaint.preferredTime = data.preferredTime;
    if (data.instructions !== undefined) complaint.instructions = data.instructions;

    await complaint.save();

    revalidatePath('/profile');
    return { success: true, message: 'Booking updated successfully.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Server Action for cancelling a booking
 */
export async function cancelBookingAction(id, reason = 'Cancelled by customer') {
  try {
    await connectDB();
    const user = await getAuthUser();
    if (!user) return { success: false, message: 'Unauthorized' };

    const complaint = await Complaint.findById(id);
    if (!complaint) return { success: false, message: 'Booking not found' };

    if (complaint.userId.toString() !== user._id.toString()) {
      return { success: false, message: 'Forbidden' };
    }

    if (complaint.isConfirmed) {
      return { success: false, message: 'Cannot cancel after confirmation by admin.' };
    }

    complaint.status = 'Cancelled';
    complaint.cancelledBy = 'Customer';
    complaint.cancelReason = reason;

    await complaint.save();

    revalidatePath('/profile');
    revalidatePath('/admin');
    return { success: true, message: 'Booking cancelled successfully.' };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
