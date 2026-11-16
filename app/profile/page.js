'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUserBookings } from '@/hooks/useBookings';
import { useUserCoupons } from '@/hooks/useCoupons';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import PaymentModal from '@/components/dashboard/PaymentModal';
import EditBookingModal from '@/components/dashboard/EditBookingModal';
import CancelConfirmModal from '@/components/dashboard/CancelConfirmModal';
import { RealtimeIndicator } from '@/components/realtime/RealtimeStatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  User as UserIcon,
  Calendar,
  Tag,
  Phone,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

function ProfileContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'bookings' || searchParams.get('tab') === 'complaints'
    ? 'bookings'
    : searchParams.get('tab') === 'coupons'
    ? 'coupons'
    : 'info';

  const [activeTab, setActiveTab] = useState(initialTab);
  const { user, token, updateUserProfile, logout } = useAuth();
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } =
    useUserBookings(token);
  const { data: coupons = [], isLoading: couponsLoading } = useUserCoupons(token);

  // Profile Edit State
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [profileMsg, setProfileMsg] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Modals state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(null);

  useEffect(() => {
    if (user) {
      setMobile(user.mobile || '');
      setLocation(user.location || '');
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setProfileMsg(null);
    const res = await updateUserProfile({ mobile, location });
    if (res.success) {
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setProfileMsg({ type: 'error', text: res.message || 'Failed to update profile.' });
    }
    setIsUpdating(false);
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  if (!user && !token) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-heading">
          Sign In to Access Profile
        </h2>
        <p className="text-sm text-slate-500">
          Please sign in with Google to view your service requests, bookings, coupons, and account information.
        </p>
        <Button
          variant="primary"
          onClick={() => {
            if (window.google?.accounts?.id) {
              window.google.accounts.id.prompt();
            }
          }}
          className="w-full"
        >
          Sign In with Google
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          {user?.picture ? (
            <Image
              src={user.picture}
              alt={user.name}
              width={80}
              height={80}
              className="rounded-2xl object-cover border-2 border-brand-500"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-2xl">
              {user?.name?.charAt(0) || 'U'}
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shadow-md">
            ✓
          </span>
        </div>

        <div className="text-center sm:text-left space-y-1 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
            {user?.name}
          </h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-slate-500">
            {user?.mobile && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-brand-600" />
                {user.mobile}
              </span>
            )}
            {user?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                {user.location}
              </span>
            )}
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={logout} className="shrink-0">
          Sign Out
        </Button>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'info'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          Personal Info
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          My Bookings ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'coupons'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          My Coupons ({coupons.length})
        </button>
      </div>

      {/* TAB 1: PERSONAL INFO */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm max-w-2xl">
          <h2 className="text-xl font-bold text-slate-900 font-heading mb-6">
            Update Profile Information
          </h2>

          {profileMsg && (
            <div
              className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2.5 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <Input
              id="name"
              label="Full Name (Verified with Google)"
              value={user?.name || ''}
              disabled
              className="bg-slate-50 cursor-not-allowed"
            />
            <Input
              id="email"
              label="Email Address"
              value={user?.email || ''}
              disabled
              className="bg-slate-50 cursor-not-allowed"
            />
            <Input
              id="mobile"
              label="Mobile Number (10 Digits)"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
            <Input
              id="location"
              label="Service Address / Area"
              placeholder="e.g. Babatpur, Varanasi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div className="pt-2">
              <Button type="submit" variant="primary" isLoading={isUpdating}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: MY BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Live Service Booking Tracker
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Statuses synchronize in real-time when a technician is assigned, calls, or arrives at your doorstep.
              </p>
            </div>
            <RealtimeIndicator />
          </div>

          {bookingsLoading ? (
            <div className="p-12 text-center text-slate-400">Loading your bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-heading">
                No Service Bookings Found
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                You haven&apos;t booked any appliance repair yet. Need a quick fix for your AC or fridge?
              </p>
              <Button variant="primary" onClick={() => (window.location.href = '/booking')}>
                Book a Service Now
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className={`bg-white rounded-3xl p-6 border shadow-sm flex flex-col justify-between space-y-4 transition-all duration-500 ${
                    b._justUpdated
                      ? 'border-emerald-500 ring-2 ring-emerald-400/20 bg-emerald-50/20 animate-pulse'
                      : 'border-slate-200/80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                            Request #{b._id.slice(-6)}
                          </span>
                          {b._justUpdated && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 animate-bounce">
                              Just Updated
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 font-heading">
                          {b.serviceType}
                        </h3>
                      </div>
                      <Badge status={b.status} />
                    </div>

                    <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3.5 rounded-2xl">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Date: {formatDate(b.preferredDate)}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Slot: {b.preferredTime}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Location: {b.location}</span>
                      </p>
                      {b.amount > 0 && (
                        <p className="flex items-center justify-between pt-1 border-t border-slate-200 font-semibold text-slate-900">
                          <span>Service Charge:</span>
                          <span className="text-brand-600 text-sm">
                            {formatCurrency(b.amount)}
                          </span>
                        </p>
                      )}
                      {b.paymentStatus === 'Paid' && (
                        <div className="pt-1 flex items-center justify-between text-emerald-700 font-bold">
                          <span>Payment Status:</span>
                          <span>PAID ✓</span>
                        </div>
                      )}
                    </div>

                    {b.updatedAt && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 px-1">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>Last Activity:</span>
                        </span>
                        <span className="font-semibold text-slate-600">
                          {new Date(b.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {formatDate(b.updatedAt)}
                        </span>
                      </div>
                    )}

                    {b.instructions && (
                      <p className="text-xs text-slate-500 italic bg-white p-2 border border-slate-100 rounded-xl">
                        &ldquo;{b.instructions}&rdquo;
                      </p>
                    )}

                    {b.cancelReason && (
                      <p className="text-xs text-rose-600 font-medium">
                        Cancelled by {b.cancelledBy}: {b.cancelReason}
                      </p>
                    )}
                  </div>

                  {/* Booking Actions */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {/* Pay Button if Amount is set and Payment is Pending */}
                    {b.amount > 0 && b.paymentStatus === 'Pending' && b.status !== 'Cancelled' && (
                      <Button
                        variant="success"
                        size="sm"
                        icon={CreditCard}
                        onClick={() => {
                          setSelectedComplaint(b);
                          setIsPaymentOpen(true);
                        }}
                      >
                        Pay Online ({formatCurrency(b.amount)})
                      </Button>
                    )}

                    {/* Edit button if NOT confirmed and NOT cancelled/completed */}
                    {!b.isConfirmed && !['Cancelled', 'Completed'].includes(b.status) && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Edit2}
                        onClick={() => {
                          setSelectedComplaint(b);
                          setIsEditOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    )}

                    {/* Cancel button if NOT confirmed and NOT cancelled */}
                    {!b.isConfirmed && b.status !== 'Cancelled' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50"
                        icon={Trash2}
                        onClick={() => {
                          setSelectedComplaint(b);
                          setIsCancelOpen(true);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY COUPONS */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          {couponsLoading ? (
            <div className="p-12 text-center text-slate-400">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <p className="text-slate-500 text-sm">No discount coupons available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((c) => (
                <div
                  key={c._id}
                  className="bg-white rounded-3xl p-6 border-2 border-dashed border-brand-200 shadow-sm relative overflow-hidden flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded-md bg-amber-100 text-amber-900">
                        {c.discountType === 'Flat'
                          ? `₹${c.discountValue} OFF`
                          : `${c.discountValue || c.discount}% OFF`}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Expires {formatDate(c.expiryDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <span className="font-mono text-lg font-black tracking-wider text-brand-700">
                        {c.code}
                      </span>
                      <button
                        onClick={() => copyCouponCode(c.code)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition"
                        title="Copy coupon code"
                      >
                        {copiedCoupon === c.code ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      Applies to: <span className="text-slate-900">{c.serviceType}</span>
                    </p>
                    {c.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">{c.description}</p>
                    )}
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-100 text-center">
                    <span className="text-[11px] text-brand-600 font-semibold">
                      Use during online bill payment
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        complaint={selectedComplaint}
        onSuccess={() => refetchBookings()}
      />

      <EditBookingModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        complaint={selectedComplaint}
        onSuccess={() => refetchBookings()}
      />

      <CancelConfirmModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        complaint={selectedComplaint}
        onSuccess={() => refetchBookings()}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">
          Loading your customer profile...
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
