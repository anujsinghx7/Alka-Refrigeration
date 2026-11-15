'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Home, Calendar, User, ShieldCheck, Wrench } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Services', href: '/services', icon: Wrench },
    { label: 'Bookings', href: user ? '/profile?tab=bookings' : '/booking', icon: Calendar },
    { label: 'Profile', href: '/profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Admin', href: '/admin', icon: ShieldCheck });
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-3 flex items-center justify-around shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || (item.href.includes('tab=') && pathname === '/profile');
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors ${
              isActive
                ? 'text-brand-600 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
