/**
 * Report Routes
 * Excel export endpoints for admin
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const { exportCustomers, exportComplaints, exportServiceAnalysis } = require('../controllers/reportController');

// All export routes require admin access
router.use(protect, isAdmin);

// GET /api/admin/export/customers — Download customer report
router.get('/customers', exportCustomers);

// GET /api/admin/export/complaints — Download complaint report
router.get('/complaints', exportComplaints);

// GET /api/admin/export/service-analysis — Download service analysis report
router.get('/service-analysis', exportServiceAnalysis);

module.exports = router;
