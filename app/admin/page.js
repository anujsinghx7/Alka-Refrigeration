'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
  useAdminComplaints,
  useAdminStats,
  useAdminCustomers,
} from '@/hooks/useBookings';
import { useAdminStore } from '@/store/useAdminStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Tag,
  FileSpreadsheet,
  Phone,
  CheckCircle,
  Truck,
  DollarSign,
  Ban,
  Search,
  Download,
  AlertTriangle,
  ShieldCheck,
  Check,
} from 'lucide-react';

export default function AdminPage() {
  const { user, token, isAdmin, isLoading: authLoading } = useAuth();
  const {
    activeSection,
    setActiveSection,
    workStatusFilter,
    setWorkStatusFilter,
    searchQuery,
    setSearchQuery,
  } = useAdminStore();

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useAdminStats(token);
  const {
    data: complaints = [],
    isLoading: complaintsLoading,
    refetch: refetchComplaints,
  } = useAdminComplaints(token, workStatusFilter === 'All' ? '' : workStatusFilter);
  const { data: customers = [], isLoading: customersLoading } = useAdminCustomers(token);

  // Amount Modal
  const [amountModalOpen, setAmountModalOpen] = useState(false);
  const [amountTargetComplaint, setAmountTargetComplaint] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [amountLoading, setAmountLoading] = useState(false);

  // Admin Cancel Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTargetComplaint, setCancelTargetComplaint] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Coupon Creation Form
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState('Percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [serviceType, setServiceType] = useState('All Services');
  const [expiryDate, setExpiryDate] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [couponSubmitting, setCouponSubmitting] = useState(false);
  const [couponMsg, setCouponMsg] = useState(null);

  // Filtered complaints by search
  const filteredComplaints = complaints.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.mobile?.includes(q) ||
      c.location?.toLowerCase().includes(q) ||
      c.serviceType?.toLowerCase().includes(q)
    );
  });

  // Action handlers
  const handleConfirmCall = async (id) => {
    try {
      const res = await fetch(`/api/admin/complaint/${id}/confirm`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        refetchComplaints();
        refetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id, statusUpdates) => {
    try {
      const res = await fetch(`/api/admin/complaint/${id}/update-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(statusUpdates),
      });
      if (res.ok) {
        refetchComplaints();
        refetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveAmount = async (e) => {
    e.preventDefault();
    if (!amountTargetComplaint) return;
    setAmountLoading(true);
    try {
      const res = await fetch(`/api/admin/complaint/${amountTargetComplaint._id}/update-amount`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: Number(newAmount) }),
      });
      if (res.ok) {
        setAmountModalOpen(false);
        refetchComplaints();
        refetchStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAmountLoading(false);
    }
  };

  const handleAdminCancel = async (e) => {
    e.preventDefault();
    if (!cancelTargetComplaint) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/admin/complaint/${cancelTargetComplaint._id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });
      if (res.ok) {
        setCancelModalOpen(false);
        setCancelReason('');
        refetchComplaints();
        refetchStats();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setCouponSubmitting(true);
    setCouponMsg(null);
    try {
      const endpoint = targetUserId ? '/api/admin/coupons/send' : '/api/admin/coupons';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode,
          discountType,
          discountValue: Number(discountValue),
          serviceType,
          expiryDate,
          description: couponDesc,
          userId: targetUserId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create coupon');

      setCouponMsg({ type: 'success', text: data.message || 'Coupon created successfully!' });
      setCouponCode('');
      setDiscountValue('');
      setExpiryDate('');
      setCouponDesc('');
      setTargetUserId('');
    } catch (err) {
      setCouponMsg({ type: 'error', text: err.message });
    } finally {
      setCouponSubmitting(false);
    }
  };

  const downloadReport = async (type) => {
    try {
      const res = await fetch(`/api/admin/export/${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download report: ' + err.message);
    }
  };

  if (authLoading) {
    return <div className="p-20 text-center text-slate-500">Checking authorization...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-heading">Access Denied</h2>
        <p className="text-sm text-slate-500">
          This dashboard requires verified administrative privileges. Please log in with the official Alka Refrigeration administrator Google account ({process.env.NEXT_PUBLIC_ADMIN_EMAIL}).
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Administrative Control Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading">
            Alka Refrigeration Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Signed in as <span className="text-white font-medium">{user?.email}</span>
          </p>
        </div>

        {/* Section Navigation Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'complaints', label: 'Complaints', icon: ClipboardList },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
          ].map((sec) => {
            const Icon = sec.icon;
            const active = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                  active
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Bookings</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1">
            {stats?.totalComplaints || 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-amber-600 uppercase">Work Pending</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-heading mt-1">
            {stats?.pendingComplaints || 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Work Completed</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-heading mt-1">
            {stats?.completedComplaints || 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-brand-600 uppercase">Total Customers</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-brand-600 font-heading mt-1">
            {stats?.totalCustomers || 0}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Revenue</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading mt-1">
            {formatCurrency(stats?.totalRevenue || 0)}
          </p>
        </div>
      </div>

      {/* SECTION 1: OVERVIEW & RECENT COMPLAINTS */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Recent Service Requests
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveSection('complaints')}
            >
              View All ({complaints.length})
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.slice(0, 6).map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-brand-600 uppercase">
                      #{c._id.slice(-6)}
                    </span>
                    <h3 className="font-bold text-slate-900 font-heading">{c.serviceType}</h3>
                    <p className="text-xs text-slate-500">{c.name}</p>
                  </div>
                  <Badge status={c.status} />
                </div>
                <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
                  <p>📞 {c.mobile}</p>
                  <p>📍 {c.location}</p>
                  <p>📅 {formatDate(c.preferredDate)} ({c.preferredTime})</p>
                </div>
                <div className="pt-2 flex justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setWorkStatusFilter('All');
                      setActiveSection('complaints');
                    }}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: COMPLAINTS MANAGEMENT */}
      {activeSection === 'complaints' && (
        <div className="space-y-6">
          {/* Controls: Filter Tabs + Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex gap-2">
              {['Pending', 'Done', 'All'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setWorkStatusFilter(tab)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    workStatusFilter === tab
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab === 'Pending' ? '⏳ Work Pending' : tab === 'Done' ? '✅ Work Done' : '📋 All'}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search customer, phone, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {/* Complaints Grid */}
          {complaintsLoading ? (
            <div className="p-12 text-center text-slate-400">Loading complaints...</div>
          ) : filteredComplaints.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 text-slate-500">
              No service requests match the filter criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredComplaints.map((c) => (
                <div
                  key={c._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-brand-600 uppercase">
                          #{c._id.slice(-6)}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 font-heading">
                          {c.serviceType}
                        </h3>
                        <p className="text-xs text-slate-600 font-medium">Customer: {c.name}</p>
                      </div>
                      <Badge status={c.status} />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-700 space-y-1.5">
                      <p>
                        <strong className="text-slate-900">Phone:</strong>{' '}
                        <a href={`tel:${c.mobile}`} className="text-brand-600 underline">
                          {c.mobile}
                        </a>
                      </p>
                      <p>
                        <strong className="text-slate-900">Location:</strong> {c.location}
                      </p>
                      <p>
                        <strong className="text-slate-900">Preferred:</strong>{' '}
                        {formatDate(c.preferredDate)} ({c.preferredTime})
                      </p>
                      {c.instructions && (
                        <p className="italic text-slate-500 mt-1">
                          &ldquo;{c.instructions}&rdquo;
                        </p>
                      )}
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap justify-between gap-2">
                        <span>
                          Call: <strong>{c.callStatus}</strong>
                        </span>
                        <span>
                          Confirmed: <strong>{c.isConfirmed ? 'Yes' : 'No'}</strong>
                        </span>
                        <span>
                          Technician: <strong>{c.technicianStatus}</strong>
                        </span>
                        <span>
                          Work: <strong>{c.workStatus}</strong>
                        </span>
                      </div>
                      <div className="pt-1 flex items-center justify-between text-sm font-bold text-slate-900">
                        <span>Charge Amount:</span>
                        <span className="text-brand-600">{formatCurrency(c.amount)}</span>
                      </div>
                      {c.paymentStatus === 'Paid' && (
                        <p className="text-emerald-700 font-bold">Payment Status: PAID ✓</p>
                      )}
                      {c.cancelReason && (
                        <p className="text-rose-600 font-medium">
                          Cancelled ({c.cancelledBy}): {c.cancelReason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Admin Operation Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    {/* Confirm Call */}
                    {!c.isConfirmed && c.status !== 'Cancelled' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Phone}
                        onClick={() => handleConfirmCall(c._id)}
                      >
                        Confirm Call
                      </Button>
                    )}

                    {/* Assign Technician On The Way */}
                    {c.technicianStatus !== 'On The Way' && c.status !== 'Cancelled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        icon={Truck}
                        onClick={() =>
                          handleUpdateStatus(c._id, { technicianStatus: 'On The Way' })
                        }
                      >
                        On The Way
                      </Button>
                    )}

                    {/* Mark Work Done */}
                    {c.workStatus !== 'Done' && c.status !== 'Cancelled' && (
                      <Button
                        variant="success"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => handleUpdateStatus(c._id, { workStatus: 'Done' })}
                      >
                        Mark Done
                      </Button>
                    )}

                    {/* Update Service Amount */}
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={DollarSign}
                      onClick={() => {
                        setAmountTargetComplaint(c);
                        setNewAmount(c.amount || '');
                        setAmountModalOpen(true);
                      }}
                    >
                      Set Amount
                    </Button>

                    {/* Admin Cancel */}
                    {c.status !== 'Cancelled' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50"
                        icon={Ban}
                        onClick={() => {
                          setCancelTargetComplaint(c);
                          setCancelModalOpen(true);
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

      {/* SECTION 3: CUSTOMER DIRECTORY */}
      {activeSection === 'customers' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                Registered Customers ({customers.length})
              </h2>
              <p className="text-xs text-slate-500">All registered users and contact directory</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={() => downloadReport('customers')}
            >
              Export Excel
            </Button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-bold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Mobile</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                      {cust.picture ? (
                        <Image
                          src={cust.picture}
                          alt={cust.name}
                          width={28}
                          height={28}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                          {cust.name?.charAt(0)}
                        </div>
                      )}
                      <span>{cust.name}</span>
                    </td>
                    <td className="p-3.5">{cust.email}</td>
                    <td className="p-3.5">{cust.mobile || '—'}</td>
                    <td className="p-3.5">{cust.location || '—'}</td>
                    <td className="p-3.5 text-xs text-slate-400">{formatDate(cust.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 4: CREATE COUPONS */}
      {activeSection === 'coupons' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Create Promotional Coupon
            </h2>
            <p className="text-xs text-slate-500">
              Issue global discount vouchers or assign an exclusive coupon to a specific customer.
            </p>
          </div>

          {couponMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold ${
                couponMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {couponMsg.text}
            </div>
          )}

          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <Input
              id="coupon-code"
              label="Coupon Code (e.g. SUMMER25)"
              required
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Flat">Flat Amount (₹)</option>
                </select>
              </div>

              <Input
                id="discount-val"
                label="Value (e.g. 20 or 200)"
                type="number"
                required
                min="1"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Service Type</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="All Services">All Services</option>
                  <option value="AC Repair">AC Repair</option>
                  <option value="Fridge Repair">Fridge Repair</option>
                  <option value="Washing Machine Repair">Washing Machine Repair</option>
                  <option value="Deep Freezer Repair">Deep Freezer Repair</option>
                  <option value="Water Cooler Repair">Water Cooler Repair</option>
                </select>
              </div>

              <Input
                id="expiry"
                label="Expiry Date"
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Target Customer (Optional)
              </label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">Global — Available to All Users</option>
                {customers.map((cust) => (
                  <option key={cust._id} value={cust._id}>
                    {cust.name} ({cust.email})
                  </option>
                ))}
              </select>
            </div>

            <Input
              id="desc"
              label="Description"
              placeholder="e.g. 20% discount on first AC deep cleaning"
              value={couponDesc}
              onChange={(e) => setCouponDesc(e.target.value)}
            />

            <Button type="submit" variant="primary" isLoading={couponSubmitting} className="w-full">
              Issue Coupon
            </Button>
          </form>
        </div>
      )}

      {/* SECTION 5: EXCEL REPORTS */}
      {activeSection === 'reports' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Export Business & Analytical Reports
            </h2>
            <p className="text-xs text-slate-500">
              Generate formatted Microsoft Excel (.xlsx) spreadsheets using ExcelJS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 font-heading">
                  Customer Directory
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Export complete register of customer names, emails, mobile numbers, locations, and join dates.
                </p>
              </div>
              <Button
                variant="primary"
                icon={Download}
                onClick={() => downloadReport('customers')}
              >
                Download Customers.xlsx
              </Button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 font-heading">
                  Complaints & Bookings
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Export all service complaints with call tracking, technician status, work status, and payment records.
                </p>
              </div>
              <Button
                variant="primary"
                icon={Download}
                onClick={() => downloadReport('complaints')}
              >
                Download Complaints.xlsx
              </Button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 font-heading">
                  Service Type Analysis
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Detailed category-wise aggregation of complaint volume, completion rate, collected revenue, and pending dues.
                </p>
              </div>
              <Button
                variant="primary"
                icon={Download}
                onClick={() => downloadReport('service-analysis')}
              >
                Download Analysis.xlsx
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE AMOUNT MODAL */}
      <Modal
        isOpen={amountModalOpen}
        onClose={() => setAmountModalOpen(false)}
        title="Set Service Amount"
      >
        <form onSubmit={handleSaveAmount} className="space-y-4">
          <p className="text-sm text-slate-600">
            Set or update the final service charge for{' '}
            <strong>{amountTargetComplaint?.name}</strong> ({amountTargetComplaint?.serviceType}):
          </p>
          <Input
            id="amount"
            label="Amount (₹)"
            type="number"
            min="0"
            required
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setAmountModalOpen(false)}
              disabled={amountLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={amountLoading}>
              Save Amount
            </Button>
          </div>
        </form>
      </Modal>

      {/* ADMIN CANCEL MODAL */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Booking (Admin)"
      >
        <form onSubmit={handleAdminCancel} className="space-y-4">
          <p className="text-sm text-slate-600">
            Please provide a cancellation reason. This explanation will be displayed to the customer:
          </p>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Reason *</label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Out of service area, technician unavailable, duplicate booking..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelLoading}
            >
              Back
            </Button>
            <Button type="submit" variant="danger" isLoading={cancelLoading}>
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
