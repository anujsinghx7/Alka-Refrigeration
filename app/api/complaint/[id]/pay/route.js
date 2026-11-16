import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import Coupon from '@/models/Coupon';
import { getAuthUser } from '@/lib/auth';
import { emitBookingStatusUpdate } from '@/lib/socketServer';

export async function POST(req, { params }) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { couponId } = await req.json().catch(() => ({}));

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return NextResponse.json({ message: 'Complaint not found' }, { status: 404 });
    }

    if (complaint.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
    }

    if (complaint.paymentStatus === 'Paid') {
      return NextResponse.json({ message: 'Payment already completed' }, { status: 400 });
    }

    if (complaint.amount <= 0) {
      return NextResponse.json({ message: 'No charge amount set yet by admin' }, { status: 400 });
    }

    let finalAmount = complaint.amount;
    let appliedCoupon = null;

    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      if (!coupon) return NextResponse.json({ message: 'Coupon not found' }, { status: 404 });
      if (coupon.isUsed) return NextResponse.json({ message: 'Coupon already used' }, { status: 400 });
      if (!coupon.isActive) return NextResponse.json({ message: 'Coupon is inactive' }, { status: 400 });
      if (new Date(coupon.expiryDate) < new Date()) {
        return NextResponse.json({ message: 'Coupon has expired' }, { status: 400 });
      }
      if (coupon.userId && coupon.userId.toString() !== user._id.toString()) {
        return NextResponse.json({ message: 'Coupon not assigned to you' }, { status: 403 });
      }
      if (coupon.serviceType !== 'All Services' && coupon.serviceType !== complaint.serviceType) {
        return NextResponse.json({ message: `Coupon only valid for ${coupon.serviceType}` }, { status: 400 });
      }

      const discountType = coupon.discountType || 'Percentage';
      const discountValue = coupon.discountValue || coupon.discount;

      if (discountType === 'Percentage') {
        finalAmount = complaint.amount - (complaint.amount * discountValue) / 100;
      } else {
        finalAmount = complaint.amount - discountValue;
      }
      finalAmount = Math.max(Math.round(finalAmount * 100) / 100, 0);

      coupon.isUsed = true;
      await coupon.save();
      appliedCoupon = coupon._id;
    }

    complaint.paymentStatus = 'Paid';
    complaint.amount = finalAmount;
    if (appliedCoupon) complaint.couponApplied = appliedCoupon;
    await complaint.save();

    // Emit real-time payment update
    try {
      emitBookingStatusUpdate(complaint);
    } catch (socketErr) {
      console.error('Socket.IO emit error:', socketErr);
    }

    return NextResponse.json({
      message: 'Payment completed successfully!',
      complaint: {
        _id: complaint._id,
        amount: finalAmount,
        paymentStatus: 'Paid',
        couponApplied: appliedCoupon,
      },
    });
  } catch (error) {
    console.error('Simulate payment error:', error);
    return NextResponse.json(
      { message: 'Payment failed' },
      { status: 500 }
    );
  }
}
