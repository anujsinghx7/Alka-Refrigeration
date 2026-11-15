import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import Coupon from '@/models/Coupon';
import { getAuthUser } from '@/lib/auth';

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      complaintId,
      couponId,
      finalAmount,
    } = await req.json();

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { message: 'Payment verification failed: invalid signature' },
        { status: 400 }
      );
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return NextResponse.json({ message: 'Complaint not found' }, { status: 404 });
    }

    complaint.paymentStatus = 'Paid';
    complaint.razorpayOrderId = razorpay_order_id;
    complaint.razorpayPaymentId = razorpay_payment_id;
    if (finalAmount !== undefined) complaint.amount = finalAmount;

    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      if (coupon) {
        coupon.isUsed = true;
        await coupon.save();
        complaint.couponApplied = coupon._id;
      }
    }

    await complaint.save();

    return NextResponse.json({
      message: 'Payment verified and completed successfully!',
      complaint,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { message: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
