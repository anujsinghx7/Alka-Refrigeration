import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-brand-600 animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-base font-medium text-slate-700">Loading Alka Refrigeration...</p>
      <p className="text-xs text-slate-400 mt-1">Fetching services and real-time updates</p>
    </div>
  );
}
