import React from 'react';
import { cn } from '@/lib/utils';

export default function Badge({ status, className }) {
  const getBadgeStyle = (s) => {
    switch (s) {
      case 'Confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'On The Way':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Completed':
      case 'Done':
      case 'Paid':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Called':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        getBadgeStyle(status),
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status}
    </span>
  );
}
