/**
 * Admin Controller
 * Handles admin dashboard operations
 */

const Complaint = require('../models/Complaint');
const User      = require('../models/User');
const Coupon    = require('../models/Coupon');

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/admin/complaints
// @desc    Get all complaints with optional workStatus filter
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAllComplaints = async (req, res) => {
  try {
    const { workStatus } = req.query;
    const filter = {};

    if (workStatus && ['Pending', 'Done'].includes(workStatus)) {
      filter.workStatus = workStatus;
    }

    const complaints = await Complaint.find(filter)
      .populate('userId', 'name email mobile picture')
      .populate('couponApplied', 'code discountType discountValue discount')
      .sort({ createdAt: -1 });

    res.status(200).json({ complaints });
  } catch (error) {
    console.error('Admin get complaints error:', error.message);
    res.status(500).json({ message: 'Failed to fetch complaints' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/admin/complaint/:id/update-status
// @desc    Update complaint status fields
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, callStatus, workStatus, technicianStatus } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (status)          complaint.status = status;
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

    res.status(200).json({ message: 'Complaint status updated', complaint: updated });
  } catch (error) {
    console.error('Update complaint status error:', error.message);
    res.status(500).json({ message: 'Failed to update complaint status' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/admin/complaint/:id/confirm
// @desc    Mark complaint as confirmed after call
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const confirmComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.isConfirmed = true;
    complaint.callStatus  = 'Called';
    complaint.status      = 'Confirmed';

    await complaint.save();

    const updated = await Complaint.findById(id).populate('userId', 'name email mobile picture');
    res.status(200).json({ message: 'Complaint confirmed', complaint: updated });
  } catch (error) {
    console.error('Confirm complaint error:', error.message);
    res.status(500).json({ message: 'Failed to confirm complaint' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/admin/complaint/:id/cancel
// @desc    Admin cancels a booking with a reason
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const adminCancelComplaint = async (req, res) => {
  try {
    const { id }     = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: 'Cancel reason is required' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (complaint.status === 'Cancelled') {
      return res.status(400).json({ message: 'Complaint is already cancelled' });
    }

    complaint.status       = 'Cancelled';
    complaint.cancelledBy  = 'Admin';
    complaint.cancelReason = reason.trim();

    await complaint.save();

    const updated = await Complaint.findById(id).populate('userId', 'name email mobile picture');
    res.status(200).json({ message: 'Booking cancelled by admin', complaint: updated });
  } catch (error) {
    console.error('Admin cancel complaint error:', error.message);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   PATCH /api/admin/complaint/:id/update-amount
// @desc    Set the service amount after technician visit
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const updateComplaintAmount = async (req, res) => {
  try {
    const { id }     = req.params;
    const { amount } = req.body;

    if (amount === undefined || amount < 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.amount = amount;
    await complaint.save();

    res.status(200).json({ message: 'Amount updated', complaint });
  } catch (error) {
    console.error('Update amount error:', error.message);
    res.status(500).json({ message: 'Failed to update amount' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/admin/coupons
// @desc    Create a new coupon (global or user-specific)
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, serviceType, expiryDate, description, userId } = req.body;

    if (!code || !discountValue || !expiryDate) {
      return res.status(400).json({ message: 'Code, discount value, and expiry date are required' });
    }

    const discount = discountType === 'Percentage' ? discountValue : 100;

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      userId: userId || null,
      discount,
      discountType:  discountType  || 'Percentage',
      discountValue,
      serviceType:   serviceType   || 'All Services',
      expiryDate,
      description:   description   || '',
      isActive: true,
      isUsed:   false,
    });

    res.status(201).json({ message: 'Coupon created successfully', coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    console.error('Create coupon error:', error.message);
    res.status(500).json({ message: 'Failed to create coupon' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   POST /api/admin/coupons/send
// @desc    Send a coupon to a specific user
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const sendCouponToUser = async (req, res) => {
  try {
    const { code, discountType, discountValue, serviceType, expiryDate, description, userId } = req.body;

    if (!userId || !code || !discountValue || !expiryDate) {
      return res.status(400).json({ message: 'userId, code, discount value, and expiry date are required' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const discount = discountType === 'Percentage' ? discountValue : 100;

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      userId,
      discount,
      discountType:  discountType  || 'Percentage',
      discountValue,
      serviceType:   serviceType   || 'All Services',
      expiryDate,
      description:   description   || `Special coupon for ${user.name}`,
      isActive: true,
      isUsed:   false,
    });

    res.status(201).json({ message: `Coupon sent to ${user.name}`, coupon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }
    console.error('Send coupon error:', error.message);
    res.status(500).json({ message: 'Failed to send coupon' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/admin/customers
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: { $ne: 'admin' } })
      .select('-__v')
      .sort({ createdAt: -1 });

    res.status(200).json({ customers });
  } catch (error) {
    console.error('Get customers error:', error.message);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @route   GET /api/admin/stats
// @access  Admin
// ─────────────────────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [totalComplaints, pendingComplaints, completedComplaints, totalCustomers, totalRevenue] =
      await Promise.all([
        Complaint.countDocuments(),
        Complaint.countDocuments({ workStatus: 'Pending' }),
        Complaint.countDocuments({ workStatus: 'Done' }),
        User.countDocuments({ role: { $ne: 'admin' } }),
        Complaint.aggregate([
          { $match: { paymentStatus: 'Paid' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

    res.status(200).json({
      stats: {
        totalComplaints,
        pendingComplaints,
        completedComplaints,
        totalCustomers,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error.message);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

module.exports = {
  getAllComplaints,
  updateComplaintStatus,
  confirmComplaint,
  adminCancelComplaint,
  updateComplaintAmount,
  createCoupon,
  sendCouponToUser,
  getAllCustomers,
  getDashboardStats,
};
