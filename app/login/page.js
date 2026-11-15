import React, { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Sign In | Alka Refrigeration',
  description: 'Sign in to your Alka Refrigeration customer account to manage your bookings and service requests.',
};

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-slate-50">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
