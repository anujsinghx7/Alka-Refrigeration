/**
 * Coupon Routes
 * Handles coupon/offer-related endpoints
 */

const express = require('express');
const router = express.Router();
const { getActiveCoupons, getUserCoupons } = require('../controllers/couponController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/coupons — Get all active coupons (public)
router.get('/', getActiveCoupons);

// GET /api/coupons/my-coupons — Get logged-in user's coupons (protected)
router.get('/my-coupons', protect, getUserCoupons);

module.exports = router;
