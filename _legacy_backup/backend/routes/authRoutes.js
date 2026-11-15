/**
 * Auth Routes
 * Handles authentication-related endpoints
 */

const express = require('express');
const router = express.Router();
const { googleLogin, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/google-login — Authenticate with Google
router.post('/google-login', googleLogin);

// PUT /api/auth/update-profile — Update user profile (protected)
router.put('/update-profile', protect, updateProfile);

module.exports = router;
