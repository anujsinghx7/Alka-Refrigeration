'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema, serviceTypes } from '@/schemas/bookingSchema';
import { useAuth } from '@/context/AuthContext';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useBookingStore } from '@/store/useBookingStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User as UserIcon,
  Wrench,
  CheckCircle2,
  AlertCircle,
  LocateFixed,
} from 'lucide-react';

export default function BookingForm({ initialService = '' }) {
  const { user } = useAuth();
  const { detectLocation, loading: geoLoading } = useGeolocation();
  const { selectedService, setSelectedService } = useBookingStore();
  const [submitStatus, setSubmitStatus] = useState(null); // { success: boolean, message: string }

  // Default tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: user?.name || '',
      mobile: user?.mobile || '',
      location: user?.location || '',
      serviceType: initialService || selectedService || 'AC Repair',
      preferredDate: minDate,
      preferredTime: 'Anytime',
      instructions: '',
    },
  });

  // Keep form in sync when user logs in or initialService changes
  useEffect(() => {
    if (user) {
      if (user.name) setValue('name', user.name);
      if (user.mobile) setValue('mobile', user.mobile);
      if (user.location) setValue('location', user.location);
    }
  }, [user, setValue]);

  useEffect(() => {
    if (initialService) {
      setValue('serviceType', initialService);
      setSelectedService(initialService);
    }
  }, [initialService, setValue, setSelectedService]);

  const handleLocationDetect = async () => {
    const loc = await detectLocation();
    if (loc) {
      setValue('location', loc, { shouldValidate: true });
    }
  };

  const onSubmit = async (data) => {
    setSubmitStatus(null);
    try {
      const res = await fetch('/api/complaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('alka_token') && {
            Authorization: `Bearer ${localStorage.getItem('alka_token')}`,
          }),
        },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || 'Failed to submit service request.');
      }

      setSubmitStatus({
        success: true,
        message:
          'Your service request has been confirmed! Our senior technician will contact you shortly.',
      });
      reset({
        name: user?.name || '',
        mobile: user?.mobile || '',
        location: user?.location || '',
        serviceType: 'AC Repair',
        preferredDate: minDate,
        preferredTime: 'Anytime',
        instructions: '',
      });
    } catch (err) {
      setSubmitStatus({
        success: false,
        message: err.message || 'An error occurred. Please try again or call us directly.',
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100">
      <div className="mb-8">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full mb-2">
          Doorstep Service Request
        </span>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
          Book an Appliance Repair
        </h3>
        <p className="text-slate-500 text-sm mt-1.5">
          Fast response within 30 minutes • Transparent pricing • Skilled technicians
        </p>
      </div>

      {submitStatus && (
        <div
          className={`p-4 rounded-2xl mb-6 flex items-start gap-3.5 border ${
            submitStatus.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {submitStatus.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <p className="text-sm font-medium">{submitStatus.message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <Input
            id="name"
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
            required
            icon={UserIcon}
            error={errors.name?.message}
            {...register('name')}
          />

          {/* Mobile Number */}
          <Input
            id="mobile"
            label="Mobile Number (10 Digits)"
            placeholder="e.g. 9876543210"
            required
            type="tel"
            icon={Phone}
            error={errors.mobile?.message}
            {...register('mobile')}
          />
        </div>

        {/* Location with Geolocation */}
        <div className="space-y-1.5">
          <label htmlFor="location" className="block text-sm font-medium text-slate-700">
            Service Address / Location <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="location"
                placeholder="Street address, landmark, Babatpur / Varanasi"
                className={`block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm transition-all ${
                  errors.location ? 'border-rose-400 bg-rose-50/20' : ''
                }`}
                {...register('location')}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleLocationDetect}
              isLoading={geoLoading}
              icon={LocateFixed}
              className="shrink-0"
            >
              <span className="hidden sm:inline">Auto Detect</span>
            </Button>
          </div>
          {errors.location && (
            <p className="text-xs text-rose-600 font-medium">{errors.location?.message}</p>
          )}
        </div>

        {/* Service Type Selection */}
        <div className="space-y-1.5">
          <label htmlFor="serviceType" className="block text-sm font-medium text-slate-700">
            Service Required <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Wrench className="w-4 h-4" />
            </div>
            <select
              id="serviceType"
              className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm transition-all"
              {...register('serviceType')}
            >
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          {errors.serviceType && (
            <p className="text-xs text-rose-600 font-medium">{errors.serviceType?.message}</p>
          )}
        </div>

        {/* Date & Time Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="preferredDate" className="block text-sm font-medium text-slate-700">
              Preferred Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="preferredDate"
                type="date"
                min={minDate}
                className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm transition-all"
                {...register('preferredDate')}
              />
            </div>
            {errors.preferredDate && (
              <p className="text-xs text-rose-600 font-medium">{errors.preferredDate?.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="preferredTime" className="block text-sm font-medium text-slate-700">
              Preferred Time Slot
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Clock className="w-4 h-4" />
              </div>
              <select
                id="preferredTime"
                className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm transition-all"
                {...register('preferredTime')}
              >
                <option value="Anytime">Anytime (Earliest available)</option>
                <option value="Morning (8AM - 12PM)">Morning (8:00 AM – 12:00 PM)</option>
                <option value="Afternoon (12PM - 4PM)">Afternoon (12:00 PM – 4:00 PM)</option>
                <option value="Evening (4PM - 8PM)">Evening (4:00 PM – 8:00 PM)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-1.5">
          <label htmlFor="instructions" className="block text-sm font-medium text-slate-700">
            Issue Description / Special Instructions
          </label>
          <textarea
            id="instructions"
            rows={3}
            placeholder="e.g. AC is blowing normal air instead of cold cooling, or water leaking from indoor unit..."
            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-sm transition-all"
            {...register('instructions')}
          />
          {errors.instructions && (
            <p className="text-xs text-rose-600 font-medium">{errors.instructions?.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full text-base py-3.5"
          >
            Confirm & Book Service
          </Button>
        </div>
      </form>
    </div>
  );
}
