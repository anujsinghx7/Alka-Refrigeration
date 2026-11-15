/**
 * Complaint Routes
 */

const express = require('express');
const router  = express.Router();
const {
  createComplaint,
  getUserComplaints,
  updateComplaint,
  cancelComplaint,
  createRazorpayOrder,
  verifyRazorpayPayment,
  simulatePayment,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');

// POST   /api/complaint          — Create a new complaint
router.post('/', protect, createComplaint);

// GET    /api/complaint/user     — Get logged-in user's complaints
router.get('/user', protect, getUserComplaints);

// PATCH  /api/complaint/:id/update — Customer edits a pending booking
router.patch('/:id/update', protect, updateComplaint);

// PATCH  /api/complaint/:id/cancel — Customer cancels a pending booking
router.patch('/:id/cancel', protect, cancelComplaint);

// POST   /api/complaint/:id/pay  — Legacy simulate payment (kept for compatibility)
router.post('/:id/pay', protect, simulatePayment);

module.exports = router;
