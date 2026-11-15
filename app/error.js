'use client';

import React, { useEffect } from 'react';
import Button from '@/components/ui/Button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100 shadow-sm">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 font-heading">Something went wrong</h2>
      <p className="text-sm text-slate-500 mt-2 mb-6">
        An unexpected error occurred while processing your request. Please try reloading or contact our support team.
      </p>
      <div className="flex gap-3">
        <Button variant="primary" onClick={() => reset()}>
          <RotateCcw className="w-4 h-4 mr-2 shrink-0" />
          Try Again
        </Button>
        <a href="tel:+918090546021">
          <Button variant="outline">Call Helpline</Button>
        </a>
      </div>
    </div>
  );
}
