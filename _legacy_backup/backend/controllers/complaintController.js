/**
 * Complaint Controller
 * Handles creation, retrieval, editing, cancellation,
 * and payment (Razorpay) for service complaints.
 */

const Complaint = require('../models/Complaint');
const Coupon = require('../models/Coupon');

// ── Razorpay instance (lazy-init so missing keys don't crash import) ──────────
let razorpay = null;
function getRazorpay() {
  if (!razorpay) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpay;
}

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/complaint
// @desc    Create a new service complaint
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createComplaint = async (req, res) => {
  try {
    const { name, mobile, location, serviceType, preferredDate, preferredTime, instructions } = req.body;

    if (!name || !mobile || !location || !serviceType || !preferredDate) {
      return res.status(400).json({
        message: 'Please fill in all required fields: name, mobile, location, serviceType, preferredDate',
      });
    }

    const validServices = [
      'AC Repair', 'Fridge Repair', 'Washing Machine Repair',
      'Deep Freezer Repair', 'Water Cooler Repair',
    ];
    if (!validServices.includes(serviceType)) {
      return res.status(400).json({ message: 'Invalid service type' });
    }

    const complaint = await Complaint.create({
      userId: req.user._id,
      name,
      mobile,
      location,
      serviceType,
      preferredDate,
      preferredTime: preferredTime || 'Anytime',
      instructions:  instructions  || '',
    });

    res.status(201).json({
      message: 'Complaint registered successfully! We will contact you shortly.',
      complaint,
    });
  } catch (error) {
    console.error('Create complaint error:', error.message);
    res.status(500).json({ message: 'Failed to register complaint', error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/complaint/user
// @desc    Get all complaints for the logged-in user
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id })
      .populate('couponApplied', 'code discountType discountValue discount')
      .sort({ createdAt: -1 });

    res.status(200).json({ complaints });
  } catch (error) {
    console.error('Get complaints error:', error.message);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/complaint/:id/update
// @desc    Customer edits their own booking (only if NOT confirmed)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { mobile, location, preferredDate, preferredTime, instructions } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Ownership check
    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this booking' });
    }

    // Block edit if confirmed by admin
    if (complaint.isConfirmed) {
      return res.status(400).json({ message: 'Booking is confirmed. Cannot edit online.' });
    }

    // Block edit if already cancelled or completed
    if (['Cancelled', 'Completed'].includes(complaint.status)) {
      return res.status(400).json({ message: `Cannot edit a booking with status: ${complaint.status}` });
    }

    if (mobile)        complaint.mobile        = mobile;
    if (location)      complaint.location      = location;
    if (preferredDate) complaint.preferredDate = preferredDate;
    if (preferredTime) complaint.preferredTime = preferredTime;
    if (instructions !== undefined) complaint.instructions = instructions;

    await complaint.save();

    res.status(200).json({ message: 'Booking updated successfully', complaint });
  } catch (error) {
    console.error('Update complaint error:', error.message);
    res.status(500).json({ message: 'Failed to update booking' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/complaint/:id/cancel
// @desc    Customer cancels their own booking (only if NOT confirmed)
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const cancelComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Ownership check
    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Block cancel if confirmed by admin
    if (complaint.isConfirmed) {
      return res.status(400).json({ message: 'Booking is confirmed. Cannot cancel online.' });
    }

    if (complaint.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    complaint.status      = 'Cancelled';
    complaint.cancelledBy = 'Customer';
    complaint.cancelReason = req.body.reason || 'Cancelled by customer';

    await complaint.save();

    res.status(200).json({ message: 'Booking cancelled successfully', complaint });
  } catch (error) {
    console.error('Cancel complaint error:', error.message);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/payment/create-order
// @desc    Create a Razorpay order for a complaint
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const createRazorpayOrder = async (req, res) => {
  try {
    const { complaintId, couponId } = req.body;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (complaint.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    if (complaint.amount <= 0) {
      return res.status(400).json({ message: 'No amount set for this complaint yet' });
    }

    let finalAmount  = complaint.amount;
    let appliedCoupon = null;

    // Apply coupon if provided
    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      if (!coupon)          return res.status(404).json({ message: 'Coupon not found' });
      if (coupon.isUsed)    return res.status(400).json({ message: 'Coupon already used' });
      if (!coupon.isActive) return res.status(400).json({ message: 'Coupon is inactive' });
      if (new Date(coupon.expiryDate) < new Date()) {
        return res.status(400).json({ message: 'Coupon has expired' });
      }
      if (coupon.userId && coupon.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Coupon not assigned to you' });
      }
      if (coupon.serviceType !== 'All Services' && coupon.serviceType !== complaint.serviceType) {
        return res.status(400).json({ message: `Coupon valid only for ${coupon.serviceType}` });
      }

      const discountType  = coupon.discountType  || 'Percentage';
      const discountValue = coupon.discountValue || coupon.discount;

      if (discountType === 'Percentage') {
        finalAmount = complaint.amount - (complaint.amount * discountValue / 100);
      } else {
        finalAmount = complaint.amount - discountValue;
      }
      finalAmount   = Math.max(Math.round(finalAmount * 100) / 100, 0);
      appliedCoupon = coupon;
    }

    // Create Razorpay order (amount in paise)
    const order = await getRazorpay().orders.create({
      amount:   Math.round(finalAmount * 100),
      currency: 'INR',
      receipt:  `receipt_${complaintId}`,
      notes:    { complaintId, userId: req.user._id.toString() },
    });

    res.status(200).json({
      orderId:     order.id,
      amount:      finalAmount,
      currency:    'INR',
      keyId:       process.env.RAZORPAY_KEY_ID,
      complaintId,
      couponId:    appliedCoupon ? appliedCoupon._id : null,
      userName:    req.user.name,
      userEmail:   req.user.email,
      userMobile:  req.user.mobile || complaint.mobile,
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error.message);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment & mark complaint as Paid
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const verifyRazorpayPayment = async (req, res) => {
  try {
    const crypto = require('crypto');
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      complaintId,
      couponId,
      finalAmount,
    } = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    // Mark complaint paid
    complaint.paymentStatus      = 'Paid';
    complaint.razorpayOrderId    = razorpay_order_id;
    complaint.razorpayPaymentId  = razorpay_payment_id;
    if (finalAmount !== undefined) complaint.amount = finalAmount;

    // Mark coupon used
    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      if (coupon) {
        coupon.isUsed = true;
        await coupon.save();
        complaint.couponApplied = coupon._id;
      }
    }

    await complaint.save();

    res.status(200).json({ message: 'Payment successful!', complaint });
  } catch (error) {
    console.error('Verify payment error:', error.message);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/complaint/:id/pay  (legacy simulate — kept for backward compat)
// ─────────────────────────────────────────────────────────────────────────────
const simulatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { couponId } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (complaint.paymentStatus === 'Paid') {
      return res.status(400).json({ message: 'Payment already completed' });
    }
    if (complaint.amount <= 0) {
      return res.status(400).json({ message: 'No amount set yet' });
    }

    let finalAmount = complaint.amount;
    let appliedCoupon = null;

    if (couponId) {
      const coupon = await Coupon.findById(couponId);
      if (!coupon)          return res.status(404).json({ message: 'Coupon not found' });
      if (coupon.isUsed)    return res.status(400).json({ message: 'Coupon already used' });
      if (!coupon.isActive) return res.status(400).json({ message: 'Coupon inactive' });
      if (new Date(coupon.expiryDate) < new Date()) {
        return res.status(400).json({ message: 'Coupon expired' });
      }
      if (coupon.userId && coupon.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Coupon not assigned to you' });
      }
      if (coupon.serviceType !== 'All Services' && coupon.serviceType !== complaint.serviceType) {
        return res.status(400).json({ message: `Coupon valid only for ${coupon.serviceType}` });
      }

      const discountType  = coupon.discountType  || 'Percentage';
      const discountValue = coupon.discountValue || coupon.discount;
      if (discountType === 'Percentage') {
        finalAmount = complaint.amount - (complaint.amount * discountValue / 100);
      } else {
        finalAmount = complaint.amount - discountValue;
      }
      finalAmount = Math.max(Math.round(finalAmount * 100) / 100, 0);

      coupon.isUsed = true;
      await coupon.save();
      appliedCoupon = coupon._id;
    }

    complaint.paymentStatus = 'Paid';
    complaint.amount        = finalAmount;
    if (appliedCoupon) complaint.couponApplied = appliedCoupon;
    await complaint.save();

    res.status(200).json({
      message: 'Payment successful!',
      complaint: { _id: complaint._id, amount: finalAmount, paymentStatus: 'Paid', couponApplied: appliedCoupon },
    });
  } catch (error) {
    console.error('Simulate payment error:', error.message);
    res.status(500).json({ message: 'Payment failed. Please try again.' });
  }
};

module.exports = {
  createComplaint,
  getUserComplaints,
  updateComplaint,
  cancelComplaint,
  createRazorpayOrder,
  verifyRazorpayPayment,
  simulatePayment,
};
