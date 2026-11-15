/**
 * Admin Routes
 * All routes require authentication + admin role
 */

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const {
  getAllComplaints,
  updateComplaintStatus,
  confirmComplaint,
  adminCancelComplaint,
  updateComplaintAmount,
  createCoupon,
  sendCouponToUser,
  getAllCustomers,
  getDashboardStats,
} = require('../controllers/adminController');

// Apply auth + admin middleware to all routes
router.use(protect, isAdmin);

// Dashboard stats
router.get('/stats', getDashboardStats);

// Complaint management
router.get('/complaints',                           getAllComplaints);
router.patch('/complaint/:id/update-status',        updateComplaintStatus);
router.patch('/complaint/:id/confirm',              confirmComplaint);
router.patch('/complaint/:id/update-amount',        updateComplaintAmount);
router.patch('/complaint/:id/cancel',               adminCancelComplaint);

// Coupon management
router.post('/coupons',      createCoupon);
router.post('/coupons/send', sendCouponToUser);

// Customer management
router.get('/customers', getAllCustomers);

module.exports = router;
