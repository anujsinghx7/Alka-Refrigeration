import React, { Suspense } from 'react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Reset Password | Alka Refrigeration',
  description: 'Enter your 6-digit verification code and choose a new password.',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-slate-50">
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
