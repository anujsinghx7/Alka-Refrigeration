'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useUserBookings(token) {
  return useQuery({
    queryKey: ['user-bookings', token],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch('/api/complaint/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load bookings');
      const data = await res.json();
      return data.complaints || [];
    },
    enabled: !!token,
  });
}

export function useAdminComplaints(token, workStatus = '') {
  return useQuery({
    queryKey: ['admin-complaints', token, workStatus],
    queryFn: async () => {
      if (!token) return [];
      const url = workStatus
        ? `/api/admin/complaints?workStatus=${encodeURIComponent(workStatus)}`
        : '/api/admin/complaints';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load complaints');
      const data = await res.json();
      return data.complaints || [];
    },
    enabled: !!token,
  });
}

export function useAdminStats(token) {
  return useQuery({
    queryKey: ['admin-stats', token],
    queryFn: async () => {
      if (!token) return null;
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load stats');
      const data = await res.json();
      return data.stats;
    },
    enabled: !!token,
    refetchInterval: 30000,
  });
}

export function useAdminCustomers(token) {
  return useQuery({
    queryKey: ['admin-customers', token],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch('/api/admin/customers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load customers');
      const data = await res.json();
      return data.customers || [];
    },
    enabled: !!token,
  });
}
