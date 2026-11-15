/**
 * Coupon Controller
 * Handles retrieval of active discount coupons
 */

const Coupon = require('../models/Coupon');

/**
 * @route   GET /api/coupons
 * @desc    Get all active, non-expired coupons
 * @access  Public
 */
const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();

    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: now }, // not expired
    }).sort({ discount: -1 }); // highest discount first

    res.status(200).json({ coupons });
  } catch (error) {
    console.error('Get coupons error:', error.message);
    res.status(500).json({ message: 'Failed to fetch coupons' });
  }
};

/**
 * @route   GET /api/coupons/my-coupons
 * @desc    Get coupons available for the logged-in user
 * @access  Private
 */
const getUserCoupons = async (req, res) => {
  try {
    const now = new Date();
    const userId = req.user._id;

    // Find coupons that are: (user-specific OR global) AND active AND not expired AND not used
    const coupons = await Coupon.find({
      $or: [
        { userId: userId },
        { userId: null },
      ],
      isActive: true,
      expiryDate: { $gte: now },
      isUsed: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({ coupons });
  } catch (error) {
    console.error('Get user coupons error:', error.message);
    res.status(500).json({ message: 'Failed to fetch your coupons' });
  }
};

module.exports = { getActiveCoupons, getUserCoupons };
