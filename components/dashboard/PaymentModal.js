'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useUserCoupons } from '@/hooks/useCoupons';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';
import { Check, Tag, CreditCard } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, complaint, onSuccess }) {
  const { token, user } = useAuth();
  const { data: coupons = [] } = useUserCoupons(token);
  const [selectedCouponId, setSelectedCouponId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const baseAmount = complaint?.amount || 0;

  // Filter coupons applicable to this complaint's service type
  const applicableCoupons = useMemo(() => {
    if (!complaint) return [];
    return coupons.filter(
      (c) => c.serviceType === 'All Services' || c.serviceType === complaint.serviceType
    );
  }, [coupons, complaint]);

  // Selected coupon details and calculated discount
  const { discountAmount, finalAmount, appliedCoupon } = useMemo(() => {
    if (!selectedCouponId) {
      return { discountAmount: 0, finalAmount: baseAmount, appliedCoupon: null };
    }
    const c = applicableCoupons.find((coup) => coup._id === selectedCouponId);
    if (!c) return { discountAmount: 0, finalAmount: baseAmount, appliedCoupon: null };

    const discountType = c.discountType || 'Percentage';
    const discountVal = c.discountValue || c.discount || 0;
    let disc = 0;

    if (discountType === 'Percentage') {
      disc = (baseAmount * discountVal) / 100;
    } else {
      disc = discountVal;
    }
    disc = Math.min(disc, baseAmount);
    const final = Math.max(Math.round((baseAmount - disc) * 100) / 100, 0);

    return { discountAmount: disc, finalAmount: final, appliedCoupon: c };
  }, [baseAmount, selectedCouponId, applicableCoupons]);

  // Load Razorpay Checkout SDK dynamically if not present
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handlePay = async () => {
    if (!complaint) return;
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Request Razorpay order from backend
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          complaintId: complaint._id,
          couponId: selectedCouponId || null,
        }),
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.message || 'Failed to initiate payment.');
      }

      // If Razorpay SDK is loaded and test key is provided
      if (window.Razorpay && orderData.keyId && orderData.orderId) {
        const options = {
          key: orderData.keyId,
          amount: Math.round(orderData.amount * 100),
          currency: orderData.currency || 'INR',
          name: 'Alka Refrigeration',
          description: `Payment for ${complaint.serviceType}`,
          image: '/assets/images/alka logo.png',
          order_id: orderData.orderId,
          handler: async function (response) {
            // Verify payment
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                complaintId: complaint._id,
                couponId: selectedCouponId || null,
                finalAmount,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setIsProcessing(false);
              onSuccess?.();
              onClose();
            } else {
              setError(verifyData.message || 'Payment verification failed');
              setIsProcessing(false);
            }
          },
          prefill: {
            name: orderData.userName || user?.name,
            email: orderData.userEmail || user?.email,
            contact: orderData.userMobile || user?.mobile,
          },
          theme: {
            color: '#0284c7',
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (failResponse) {
          setError(failResponse.error?.description || 'Payment transaction failed.');
          setIsProcessing(false);
        });
        rzp.open();
      } else {
        // Fallback simulate payment endpoint
        const fallbackRes = await fetch(`/api/complaint/${complaint._id}/pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ couponId: selectedCouponId || null }),
        });
        if (!fallbackRes.ok) {
          const errData = await fallbackRes.json();
          throw new Error(errData.message || 'Payment failed.');
        }
        setIsProcessing(false);
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment processing error.');
      setIsProcessing(false);
    }
  };

  if (!complaint) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pay Service Charge Online">
      <div className="space-y-5">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Service Details
          </p>
          <div className="flex justify-between items-center font-medium text-slate-900">
            <span>{complaint.serviceType}</span>
            <span className="font-bold text-slate-700">{formatCurrency(baseAmount)}</span>
          </div>
        </div>

        {/* Coupons dropdown */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-brand-600" />
            Apply Discount Coupon
          </label>
          <select
            value={selectedCouponId}
            onChange={(e) => setSelectedCouponId(e.target.value)}
            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="">No coupon selected</option>
            {applicableCoupons.map((c) => (
              <option key={c._id} value={c._id}>
                {c.code} —{' '}
                {c.discountType === 'Flat'
                  ? `Flat ₹${c.discountValue} OFF`
                  : `${c.discountValue || c.discount}% OFF`}
              </option>
            ))}
          </select>
        </div>

        {/* Summary breakdown */}
        <div className="border-t border-b border-slate-100 py-3 space-y-2 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(baseAmount)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Coupon Discount ({appliedCoupon?.code})</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-slate-900 pt-1 border-t border-slate-100">
            <span>Total Payable Amount</span>
            <span className="text-brand-600 text-lg">{formatCurrency(finalAmount)}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handlePay}
            isLoading={isProcessing}
            icon={CreditCard}
          >
            Pay {formatCurrency(finalAmount)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
