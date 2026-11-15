import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import connectDB from '@/lib/mongodb';
import Complaint from '@/models/Complaint';
import Coupon from '@/models/Coupon';
import { getAuthUser } from '@/lib/auth';

let razorpay = null;
function getRazorpay() {
  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
    });
  }
  return razorpay;
}

export async function POST(req) {
  try {
    await connectDB();
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { complaintId, couponId } = await req.json();

    const complaint = await Complaint.findById(complaintId);
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
      return NextResponse.json({ message: 'No service charge set yet' }, { status: 400 });
    }

    let finalAmount = complaint.amount;
    let appliedCoupon = null;

    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      if (!coupon) return NextResponse.json({ message: 'Coupon not found' }, { status: 404 });
      if (coupon.isUsed) return NextResponse.json({ message: 'Coupon already used' }, { status: 400 });
      if (!coupon.isActive) return NextResponse.json({ message: 'Coupon inactive' }, { status: 400 });
      if (new Date(coupon.expiryDate) < new Date()) {
        return NextResponse.json({ message: 'Coupon expired' }, { status: 400 });
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
      appliedCoupon = coupon;
    }

    // Razorpay amount is in paise (₹1 = 100 paise)
    const order = await getRazorpay().orders.create({
      amount: Math.round(finalAmount * 100),
      currency: 'INR',
      receipt: `receipt_${complaintId}`,
      notes: { complaintId, userId: user._id.toString() },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: finalAmount,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      complaintId,
      couponId: appliedCoupon ? appliedCoupon._id : null,
      userName: user.name,
      userEmail: user.email,
      userMobile: user.mobile || complaint.mobile,
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    return NextResponse.json(
      { message: 'Failed to create payment order', error: error.message },
      { status: 500 }
    );
  }
}
