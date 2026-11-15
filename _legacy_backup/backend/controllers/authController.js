/**
 * Auth Controller
 * Handles Google OAuth login flow:
 * 1. Receives Google ID token from frontend
 * 2. Verifies token with Google
 * 3. Creates or finds user in MongoDB
 * 4. Returns JWT for session management
 */

const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @route   POST /api/auth/google-login
 * @desc    Authenticate user with Google ID token
 * @access  Public
 */
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, name, email, picture } = payload;

    // Determine role based on ADMIN_EMAIL env
    const adminEmail = process.env.ADMIN_EMAIL;
    const role = (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) ? 'admin' : 'user';

    // Find existing user or create a new one
    let user = await User.findOne({ googleId });

    if (user) {
      // Update name, picture, and role in case they changed
      user.name = name;
      user.picture = picture;
      user.role = role;
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        googleId,
        name,
        email,
        picture,
        role,
      });
    }

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        location: user.location,
        picture: user.picture,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google login error:', error.message);
    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
};

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user mobile and location
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { mobile, location } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (mobile) user.mobile = mobile;
    if (location) user.location = location;

    await user.save();

    res.status(200).json({
      message: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        location: user.location,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = { googleLogin, updateProfile };
