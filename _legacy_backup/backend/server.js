/**
 * Alka Refrigeration — Backend Server
 * Express application entry point
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");


// Import routes
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const couponRoutes = require('./routes/couponRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,                 // limit per IP
  message: {
    message: "Too many requests, please try again later."
  },
  standardHeaders: true, // sends RateLimit-* headers
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: {
    message: "Too many login attempts. Try later."
  }
});

// Initialize Express app
const app = express();
app.set("trust proxy", 1);

// =============================================
// Middleware
// =============================================

// Enable CORS for frontend
// app.use(
//   cors({
//     origin: '*', // In production, restrict to your domain
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   })


// Convert CSV → array
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : ["http://localhost:5500"];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow tools like Postman / server-to-server
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn("CORS blocked:", origin);
      return callback(null, false); // no crash
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

// Parse JSON request bodies
app.use(express.json({ limit: "10kb" }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use('/api', limiter);

// =============================================
// Routes
// =============================================

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Alka Refrigeration API is running',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      complaints: '/api/complaint',
      coupons: '/api/coupons',
      admin: '/api/admin',
      exports: '/api/admin/export',
    },
  });
});

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/complaint', complaintRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/export', reportRoutes);
app.use('/api/payment', paymentRoutes);

// =============================================
// Error Handling
// =============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});
// =============================================
// Start Server
// =============================================

const PORT = process.env.PORT || 5000;

// Connect to database, then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on ${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
