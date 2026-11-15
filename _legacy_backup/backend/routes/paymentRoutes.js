/**
 * Payment Routes
 * POST /api/payment/create-order  — Create Razorpay order
 * POST /api/payment/verify        — Verify & confirm Razorpay payment
 */

const express  = require('express');
const router   = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
} = require('../controllers/complaintController');

router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify',       protect, verifyRazorpayPayment);

module.exports = router;
