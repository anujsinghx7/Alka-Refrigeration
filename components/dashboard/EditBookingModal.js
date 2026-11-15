'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';

export default function EditBookingModal({ isOpen, onClose, complaint, onSuccess }) {
  const { token } = useAuth();
  const [mobile, setMobile] = useState('');
  const [location, setLocation] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Anytime');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (complaint) {
      setMobile(complaint.mobile || '');
      setLocation(complaint.location || '');
      setPreferredDate(
        complaint.preferredDate
          ? new Date(complaint.preferredDate).toISOString().split('T')[0]
          : ''
      );
      setPreferredTime(complaint.preferredTime || 'Anytime');
      setInstructions(complaint.instructions || '');
      setError(null);
    }
  }, [complaint]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaint) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/complaint/${complaint._id}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mobile,
          location,
          preferredDate,
          preferredTime,
          instructions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update booking');

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
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Service Request">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="edit-mobile"
          label="Mobile Number"
          required
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <Input
          id="edit-location"
          label="Service Address"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="edit-date"
            label="Preferred Date"
            type="date"
            required
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Time Slot</label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="Anytime">Anytime</option>
              <option value="Morning (8AM - 12PM)">Morning (8AM - 12PM)</option>
              <option value="Afternoon (12PM - 4PM)">Afternoon (12PM - 4PM)</option>
              <option value="Evening (4PM - 8PM)">Evening (4PM - 8PM)</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-slate-700">Instructions</label>
          <textarea
            rows={3}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-3">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
