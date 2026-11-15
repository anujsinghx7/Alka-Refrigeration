'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function GoogleLoginButton({
  text = 'Continue with Google',
  redirectTo = '/profile',
  onSuccess,
}) {
  const { loginWithGoogle, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [originWarning, setOriginWarning] = useState(false);
  const router = useRouter();
  const renderedRef = useRef(false);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      return;
    }

    const handleCredentialResponse = async (response) => {
      try {
        setLoading(true);
        setErrorMessage(null);
        if (!response.credential) {
          throw new Error('No credential received from Google.');
        }

        const res = await loginWithGoogle(response.credential);
        if (res.success) {
          if (onSuccess) {
            onSuccess(res.user);
          } else {
            router.push(redirectTo);
          }
        } else {
          setErrorMessage(res.message || 'Google sign-in failed. Please try again.');
        }
      } catch (err) {
        console.error('Google Sign-In callback error:', err);
        setErrorMessage(err.message || 'An error occurred during Google sign-in.');
      } finally {
        setLoading(false);
      }
    };

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          renderedRef.current = true;
        } catch (e) {
          console.warn('GSI initialize notice:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.body.appendChild(script);
    }
  }, [loginWithGoogle, onSuccess, redirectTo, router]);

  const handleManualClick = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setErrorMessage(
        'Google Client ID is not configured in .env.local (NEXT_PUBLIC_GOOGLE_CLIENT_ID).'
      );
      return;
    }

    if (!window.google?.accounts?.id) {
      setErrorMessage('Google Sign-In is still loading. Please wait a moment and try again.');
      return;
    }

    try {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          if (reason === 'origin_mismatch' || reason === 'opt_out_or_no_session') {
            setOriginWarning(true);
          }
        }
        if (notification.isSkippedMoment()) {
          const reason = notification.getSkippedReason();
          if (reason === 'origin_mismatch') {
            setOriginWarning(true);
          }
        }
      });
    } catch (err) {
      console.error('Google prompt error:', err);
      setErrorMessage('Could not open Google prompt. Please verify your internet connection.');
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleManualClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
        ) : (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>{loading ? 'Connecting with Google...' : text}</span>
      </button>

      {errorMessage && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {originWarning && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold">Google OAuth Notice:</p>
            <p className="mt-0.5">
              To test Google Login on localhost, add <code className="bg-amber-100 px-1 rounded">http://localhost:3000</code> to <strong>Authorized JavaScript origins</strong> in your Google Cloud Console.
              Alternatively, you can sign up and sign in using <strong>Email & Password</strong> right now!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
