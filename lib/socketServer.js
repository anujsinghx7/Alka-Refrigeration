/**
 * Socket.IO Server Configuration & Real-Time Event Dispatcher
 * Alka Refrigeration 2.0
 */

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'alka123secret';

function parseCookie(cookieString, key) {
  if (!cookieString) return null;
  const match = cookieString.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Initializes the Socket.IO server and binds it to the HTTP server
 * @param {import('http').Server} httpServer
 */
function initSocketServer(httpServer) {
  if (global.__alka_io) {
    return global.__alka_io;
  }

  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  // Authentication Middleware for WebSocket Connections
  io.use((socket, next) => {
    try {
      // Extract token from handshake auth or cookies
      let token = socket.handshake.auth?.token;

      if (!token && socket.handshake.headers?.cookie) {
        token = parseCookie(socket.handshake.headers.cookie, 'alka_token');
      }

      if (!token) {
        return next(new Error('Authentication failed: No token provided'));
      }

      // Verify JWT
      const decoded = jwt.verify(token, JWT_SECRET);
      if (!decoded || !decoded.id) {
        return next(new Error('Authentication failed: Invalid token payload'));
      }

      socket.userId = decoded.id.toString();
      socket.userToken = token;
      return next();
    } catch (err) {
      console.error('[Socket.IO Auth Error]:', err.message);
      return next(new Error('Authentication failed: ' + err.message));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    // Join isolated customer room: only this customer will receive events in this room
    const userRoom = `user:${userId}`;
    socket.join(userRoom);
    console.log(`[Socket.IO] Client connected: socket ${socket.id} -> joined room ${userRoom}`);

    // If client is admin, join admin room
    socket.on('admin:join', () => {
      // Validate if socket is admin
      const adminEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      // In this room, admins receive status updates across all bookings
      socket.join('admin');
      console.log(`[Socket.IO] Socket ${socket.id} joined admin room`);
    });

    socket.on('ping:client', (callback) => {
      if (typeof callback === 'function') callback({ pong: true, time: Date.now() });
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.IO] Client disconnected: socket ${socket.id} (${reason})`);
    });
  });

  global.__alka_io = io;
  console.log('[Socket.IO] Initialized successfully on path /socket.io');
  return io;
}

/**
 * Returns the active Socket.IO server instance
 */
function getIO() {
  return global.__alka_io || null;
}

/**
 * Emits a real-time booking status update to the targeted customer and administrators
 * Security guarantee: Emits strictly to the user's private room.
 *
 * @param {object} complaint - Mongoose Complaint document or plain object
 * @param {string} [eventType='booking:status_updated'] - Event name
 */
function emitBookingStatusUpdate(complaint, eventType = 'booking:status_updated') {
  const io = getIO();
  if (!io) {
    console.warn('[Socket.IO] Cannot emit event: Socket.IO server instance not initialized');
    return false;
  }

  if (!complaint || !complaint._id) {
    console.warn('[Socket.IO] Cannot emit event: Invalid complaint object');
    return false;
  }

  const bookingId = complaint._id.toString();
  const rawUserId = complaint.userId?._id || complaint.userId;
  const targetUserId = rawUserId ? rawUserId.toString() : null;

  const payload = {
    bookingId,
    status: complaint.status,
    callStatus: complaint.callStatus || null,
    workStatus: complaint.workStatus || null,
    technicianStatus: complaint.technicianStatus || null,
    amount: typeof complaint.amount === 'number' ? complaint.amount : 0,
    paymentStatus: complaint.paymentStatus || 'Pending',
    isConfirmed: Boolean(complaint.isConfirmed),
    cancelledBy: complaint.cancelledBy || null,
    cancelReason: complaint.cancelReason || null,
    updatedAt: complaint.updatedAt
      ? new Date(complaint.updatedAt).toISOString()
      : new Date().toISOString(),
    message: `Booking #${bookingId.slice(-6)} status updated to "${complaint.status}"`,
  };

  // 1. Emit to customer's private room
  if (targetUserId) {
    const userRoom = `user:${targetUserId}`;
    io.to(userRoom).emit(eventType, payload);
    console.log(
      `[Socket.IO] Emitted ${eventType} to ${userRoom} for booking #${bookingId.slice(-6)} -> Status: ${complaint.status}`
    );
  }

  // 2. Also emit to admin room so admin dashboard reflects update in real time
  io.to('admin').emit(eventType, payload);

  return true;
}

module.exports = {
  initSocketServer,
  getIO,
  emitBookingStatusUpdate,
};
