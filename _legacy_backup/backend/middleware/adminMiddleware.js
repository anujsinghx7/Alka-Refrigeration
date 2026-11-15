/**
 * Admin Middleware
 * Checks if the authenticated user has admin role
 * Must be used AFTER the protect middleware
 */

const isAdmin = (req, res, next) => {
  // Check if user exists (protect middleware should have set this)
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  // Check role-based admin access
  if (req.user.role === 'admin') {
    return next();
  }

  // Check hardcoded admin email from environment
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail && req.user.email === adminEmail) {
    return next();
  }

  return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
};

module.exports = { isAdmin };
