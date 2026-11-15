'use client';

import { useQuery } from '@tanstack/react-query';

export function usePublicCoupons() {
  return useQuery({
    queryKey: ['public-coupons'],
    queryFn: async () => {
      const res = await fetch('/api/coupons');
      if (!res.ok) throw new Error('Failed to load coupons');
      const data = await res.json();
      return data.coupons || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserCoupons(token) {
  return useQuery({
    queryKey: ['user-coupons', token],
    queryFn: async () => {
      if (!token) return [];
      const res = await fetch('/api/coupons/my-coupons', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load user coupons');
      const data = await res.json();
      return data.coupons || [];
    },
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}
