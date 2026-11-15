'use client';

import React, { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle } from 'lucide-react';

export default function CancelConfirmModal({ isOpen, onClose, complaint, onSuccess }) {
  const { token } = useAuth();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleCancel = async () => {
    if (!complaint) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/complaint/${complaint._id}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: reason || 'Cancelled by customer' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel booking');

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!complaint) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancel Service Booking">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p>
            Are you sure you want to cancel this booking for{' '}
            <strong>{complaint.serviceType}</strong>? This action cannot be undone online.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">
            Cancellation Reason (optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Problem resolved, change of date..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Keep Booking
          </Button>
          <Button variant="danger" onClick={handleCancel} isLoading={isSubmitting}>
            Yes, Cancel Booking
          </Button>
        </div>
      </div>
    </Modal>
  );
}
