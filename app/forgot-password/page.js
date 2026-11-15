import React, { Suspense } from 'react';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Forgot Password | Alka Refrigeration',
  description: 'Reset your account password using secure email verification.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-slate-50">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}
