'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import OtpInput from './OtpInput';
import GoogleLoginButton from './GoogleLoginButton';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Mail,
  Phone,
  Lock,
  User,
  ShieldCheck,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/profile';
  const { setSession } = useAuth();

  // Multi-step state: 1 (Personal Info) | 2 (Email OTP) | 3 (Optional Mobile) | 4 (Complete)
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 Form Data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Step 2: Email OTP State
  const [emailOtp, setEmailOtp] = useState('');
  const [emailCountdown, setEmailCountdown] = useState(60);
  const [canResendEmail, setCanResendEmail] = useState(false);

  // Step 3: Mobile State
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [smsSent, setSmsSent] = useState(false);
  const [smsCountdown, setSmsCountdown] = useState(60);
  const [canResendSms, setCanResendSms] = useState(false);

  // General Status & Loading
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [createdUser, setCreatedUser] = useState(null);

  // Cooldown timers
  useEffect(() => {
    let timer;
    if (currentStep === 2 && emailCountdown > 0) {
      timer = setInterval(() => setEmailCountdown((c) => c - 1), 1000);
    } else if (currentStep === 2 && emailCountdown === 0) {
      setCanResendEmail(true);
    }
    return () => clearInterval(timer);
  }, [currentStep, emailCountdown]);

  useEffect(() => {
    let timer;
    if (smsSent && smsCountdown > 0) {
      timer = setInterval(() => setSmsCountdown((c) => c - 1), 1000);
    } else if (smsSent && smsCountdown === 0) {
      setCanResendSms(true);
    }
    return () => clearInterval(timer);
  }, [smsSent, smsCountdown]);

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  // STEP 1 SUBMIT: Validate & Request Email OTP
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify and try again.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/register/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to submit registration details.');
      }

      setSuccessNotice(data.message || 'Verification code sent to your email.');
      setCurrentStep(2);
      setEmailCountdown(60);
      setCanResendEmail(false);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 SUBMIT: Verify Email OTP & Create User Record
  const handleVerifyEmail = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');

    if (!emailOtp || emailOtp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/register/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          otp: emailOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Invalid or expired verification code.');
      }

      // Establish session in context
      if (data.token && data.user) {
        setSession(data.token, data.user, false);
        setCreatedUser(data.user);
      }

      setSuccessNotice('Email verified successfully!');
      setCurrentStep(3); // Proceed to optional mobile step
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // RESEND EMAIL OTP
  const handleResendEmailOtp = async () => {
    if (!canResendEmail || loading) return;
    setErrorMessage('');
    setSuccessNotice('');

    try {
      setLoading(true);
      const res = await fetch('/api/auth/register/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: formData.email,
          type: 'EMAIL_VERIFICATION',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to resend code.');
      }

      setSuccessNotice('New verification code sent to your email.');
      setEmailCountdown(60);
      setCanResendEmail(false);
      setEmailOtp('');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: SEND SMS OTP
  const handleSendMobileOtp = async () => {
    setErrorMessage('');
    setSuccessNotice('');

    const cleanMobile = mobileNumber.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/register/send-mobile-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: cleanMobile,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to send SMS OTP.');
      }

      setSmsSent(true);
      setSmsCountdown(60);
      setCanResendSms(false);
      setSuccessNotice(data.message || 'SMS OTP sent to your phone.');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: VERIFY SMS OTP
  const handleVerifyMobileOtp = async () => {
    setErrorMessage('');
    setSuccessNotice('');

    if (!mobileOtp || mobileOtp.length !== 6) {
      setErrorMessage('Please enter the 6-digit SMS verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/register/verify-mobile-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobileNumber.replace(/\D/g, ''),
          otp: mobileOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Invalid or expired SMS OTP.');
      }

      setSuccessNotice('Mobile number verified successfully!');
      setCurrentStep(4);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: SKIP MOBILE NUMBER
  const handleSkipMobile = () => {
    setErrorMessage('');
    setSuccessNotice('');
    setCurrentStep(4);
  };

  // FINAL: Go to dashboard/profile
  const handleCompleteRedirect = () => {
    router.push(redirectTo);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
      {/* Header & Step Tracker */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-sky-700 px-6 sm:px-8 pt-8 pb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-sm">
              AR
            </span>
            <span className="font-bold tracking-wide uppercase text-xs text-brand-100">
              Alka Refrigeration
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm">
            Step {currentStep} of 4
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {currentStep === 1 && 'Create Your Account'}
          {currentStep === 2 && 'Verify Your Email'}
          {currentStep === 3 && 'Add Mobile Number'}
          {currentStep === 4 && 'Registration Complete!'}
        </h1>
        <p className="mt-1.5 text-sm text-brand-100/90">
          {currentStep === 1 && 'Join Alka Refrigeration for instant bookings and repair tracking.'}
          {currentStep === 2 && `We sent a 6-digit code to ${formData.email || 'your email'}.`}
          {currentStep === 3 && 'Optional: Add your phone number for SMS booking updates.'}
          {currentStep === 4 && 'Your account is ready and authenticated.'}
        </p>

        {/* Progress bar */}
        <div className="mt-5 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-accent h-full transition-all duration-500 rounded-full"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* Alerts */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-sm text-red-700 animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successNotice && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-sm text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* ================= STEP 1: PERSONAL INFORMATION ================= */}
        {currentStep === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="e.g. Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating details...</span>
                </>
              ) : (
                <>
                  <span>Continue to Verification</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Alternative: Google OAuth */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400 font-semibold">Or continue with</span>
              </div>
            </div>

            <GoogleLoginButton
              text="Sign up with Google"
              redirectTo={redirectTo}
              onSuccess={() => router.push(redirectTo)}
            />

            <p className="mt-6 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-600 font-bold hover:underline">
                Sign In here
              </Link>
            </p>
          </form>
        )}

        {/* ================= STEP 2: EMAIL OTP VERIFICATION ================= */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
                <Mail className="w-7 h-7" />
              </div>
              <p className="text-sm text-slate-600">
                Enter the 6-digit verification code sent to
              </p>
              <p className="font-bold text-slate-900 text-base mt-0.5">{formData.email}</p>
            </div>

            <div>
              <OtpInput
                value={emailOtp}
                onChange={setEmailOtp}
                length={6}
                disabled={loading}
              />
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={loading || emailOtp.length !== 6}
                className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Email & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 px-1">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Edit Email
                </button>

                {canResendEmail ? (
                  <button
                    type="button"
                    onClick={handleResendEmailOtp}
                    disabled={loading}
                    className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-800 font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Resend Code
                  </button>
                ) : (
                  <span>
                    Resend code in <strong className="text-slate-800">{emailCountdown}s</strong>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: OPTIONAL MOBILE NUMBER ================= */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl mx-auto flex items-center justify-center mb-3">
                <Phone className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Add Your Mobile Number</h2>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                Add your mobile number to make your account more complete and improve communication
                about your service bookings.
              </p>
            </div>

            {!smsSent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Number (Optional)
                  </label>
                  <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10 transition">
                    <span className="inline-flex items-center px-3.5 bg-slate-50 border-r border-slate-200 text-sm font-bold text-slate-600">
                      🇮🇳 +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 text-sm font-medium outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleSendMobileOtp}
                    disabled={loading || mobileNumber.length !== 10}
                    className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify Mobile</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSkipMobile}
                    disabled={loading}
                    className="py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm transition"
                  >
                    Skip for Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-center">
                  <p className="text-xs text-slate-500">
                    Enter the 6-digit SMS code sent to +91 {mobileNumber}
                  </p>
                </div>

                <OtpInput
                  value={mobileOtp}
                  onChange={setMobileOtp}
                  length={6}
                  disabled={loading}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleVerifyMobileOtp}
                    disabled={loading || mobileOtp.length !== 6}
                    className="flex-1 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <span>Confirm Mobile OTP</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleSkipMobile}
                    className="py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm"
                  >
                    Skip for Now
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSmsSent(false);
                      setMobileOtp('');
                    }}
                    className="text-slate-600 hover:underline"
                  >
                    Change Number
                  </button>
                  {canResendSms ? (
                    <button
                      type="button"
                      onClick={handleSendMobileOtp}
                      className="text-brand-600 font-bold hover:underline"
                    >
                      Resend SMS
                    </button>
                  ) : (
                    <span>Resend in {smsCountdown}s</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 4: REGISTRATION COMPLETE ================= */}
        {currentStep === 4 && (
          <div className="text-center py-4 space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Welcome to Alka Refrigeration!
              </h2>
              <p className="mt-1 text-sm text-slate-600 max-w-sm mx-auto">
                Your account has been successfully created and verified. You are now logged in and
                ready to book appliance repairs or manage your profile.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Account Name:</span>
                <span className="font-bold text-slate-800">
                  {createdUser?.name || `${formData.firstName} ${formData.lastName}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Email Address:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {formData.email} (Verified)
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Mobile Status:</span>
                <span className="font-bold text-slate-800">
                  {createdUser?.mobileVerified ? 'Verified' : 'Pending / Skipped'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompleteRedirect}
              className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Go to Customer Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
