import React, { Suspense } from 'react';
import SignupForm from '@/components/auth/SignupForm';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Sign Up | Alka Refrigeration',
  description: 'Create your Alka Refrigeration account for fast service booking, real-time repair tracking, and secure digital invoices.',
};

export default function SignupPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-slate-50">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </div>
  );
}
