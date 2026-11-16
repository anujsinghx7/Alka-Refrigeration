'use client';

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';

const SocketContext = createContext({
  socket: null,
  isConnected: false,
  isReconnecting: false,
  lastUpdate: null,
});

export function SocketProvider({ children }) {
  const { user, token, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const socketRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Handle incoming booking update
  const handleBookingStatusUpdated = useCallback(
    (payload) => {
      console.log('[Socket.IO Client] Received booking:status_updated:', payload);

      if (!payload || !payload.bookingId) return;

      setLastUpdate({
        ...payload,
        receivedAt: new Date().toISOString(),
      });

      // 1. Immediately update TanStack Query cache for user bookings
      queryClient.setQueriesData({ queryKey: ['user-bookings'] }, (oldData) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;

        // Check if this booking exists in the user's list
        const exists = oldData.some((b) => b._id === payload.bookingId);
        if (!exists) return oldData;

        // Immutably update the matched booking
        return oldData.map((b) => {
          if (b._id === payload.bookingId) {
            return {
              ...b,
              status: payload.status,
              callStatus: payload.callStatus !== null ? payload.callStatus : b.callStatus,
              workStatus: payload.workStatus !== null ? payload.workStatus : b.workStatus,
              technicianStatus:
                payload.technicianStatus !== null ? payload.technicianStatus : b.technicianStatus,
              amount: typeof payload.amount === 'number' ? payload.amount : b.amount,
              paymentStatus: payload.paymentStatus || b.paymentStatus,
              isConfirmed:
                payload.isConfirmed !== undefined ? payload.isConfirmed : b.isConfirmed,
              cancelledBy: payload.cancelledBy || b.cancelledBy,
              cancelReason: payload.cancelReason || b.cancelReason,
              updatedAt: payload.updatedAt || b.updatedAt,
              _justUpdated: true, // Marker for visual highlight
            };
          }
          return b;
        });
      });

      // 2. Also update admin complaints query cache if active
      queryClient.setQueriesData({ queryKey: ['admin-complaints'] }, (oldData) => {
        if (!oldData || !Array.isArray(oldData)) return oldData;

        return oldData.map((c) => {
          if (c._id === payload.bookingId) {
            return {
              ...c,
              status: payload.status,
              callStatus: payload.callStatus !== null ? payload.callStatus : c.callStatus,
              workStatus: payload.workStatus !== null ? payload.workStatus : c.workStatus,
              technicianStatus:
                payload.technicianStatus !== null ? payload.technicianStatus : c.technicianStatus,
              amount: typeof payload.amount === 'number' ? payload.amount : c.amount,
              paymentStatus: payload.paymentStatus || c.paymentStatus,
              isConfirmed:
                payload.isConfirmed !== undefined ? payload.isConfirmed : c.isConfirmed,
              cancelledBy: payload.cancelledBy || c.cancelledBy,
              cancelReason: payload.cancelReason || c.cancelReason,
              updatedAt: payload.updatedAt || c.updatedAt,
              _justUpdated: true,
            };
          }
          return c;
        });
      });

      // 3. Revalidate admin stats if admin
      if (isAdmin) {
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      }
    },
    [queryClient, isAdmin]
  );

  useEffect(() => {
    // Only connect if user is authenticated with a valid JWT token
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Connect to Socket.IO server on current domain
    const socket = io('/', {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 20,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket.IO Client] Connected to real-time server with ID:', socket.id);
      setIsConnected(true);
      setIsReconnecting(false);

      // If admin, announce to join the admin broadcast room
      if (isAdmin) {
        socket.emit('admin:join');
      }
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Socket.IO Client] Disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, reconnect manually
        socket.connect();
      }
    });

    socket.on('reconnect_attempt', () => {
      setIsReconnecting(true);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket.IO Client] Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setIsReconnecting(false);

      // On reconnection, re-sync with database as source of truth
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      if (isAdmin) {
        queryClient.invalidateQueries({ queryKey: ['admin-complaints'] });
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        socket.emit('admin:join');
      }
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket.IO Client] Connection error:', error.message);
      setIsConnected(false);
    });

    // Listen for real-time status updates
    socket.on('booking:status_updated', handleBookingStatusUpdated);

    return () => {
      socket.off('booking:status_updated', handleBookingStatusUpdated);
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [token, user, isAdmin, handleBookingStatusUpdated, queryClient]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        isReconnecting,
        lastUpdate,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
