import React from 'react';
import BookingForm from '@/components/forms/BookingForm';
import { ShieldCheck, Clock, Phone, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Book a Service — Doorstep Appliance Repair in Varanasi',
  description:
    'Schedule your AC, Fridge, Washing Machine, or Deep Freezer repair in Varanasi. Easy online booking, quick doorstep visits within 30 minutes.',
};

export default function BookingPage({ searchParams }) {
  const initialService = searchParams?.service || '';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3.5 py-1.5 rounded-full">
          Instant Booking
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Schedule Doorstep Service
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Fill out the details below. Our technical supervisor will assign an expert technician to your location within 30 minutes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        {/* Form Column */}
        <div className="lg:col-span-8">
          <BookingForm initialService={initialService} />
        </div>

        {/* Info Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              How It Works
            </h3>
            <ol className="space-y-4 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Submit Request</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your appliance and preferred date/time slot.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Confirmation Call</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Our team calls to confirm the issue and estimated arrival time.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Doorstep Repair</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Technician arrives with testing tools and replacement parts.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0 text-xs">
                  4
                </span>
                <div>
                  <p className="font-semibold text-slate-900">Pay Online or Cash</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pay securely using Razorpay, apply discount coupons, or pay cash.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="bg-brand-900 rounded-3xl p-6 text-white space-y-4">
            <h4 className="font-bold text-base font-heading">Need Urgent Assistance?</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              If your cold storage, milk freezer, or AC requires emergency same-hour inspection, please call our direct hotline:
            </p>
            <a
              href="tel:+918090546021"
              className="flex items-center justify-center gap-2 bg-white text-brand-900 py-3 rounded-2xl font-bold text-sm hover:bg-brand-50 transition"
            >
              <Phone className="w-4 h-4 text-brand-600" />
              +91 8090546021
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
