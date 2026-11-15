'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3.5 py-1.5 rounded-full">
          Get In Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading">
          Contact Alka Refrigeration
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Have questions about our service coverage, commercial refrigeration AMC, or spare parts? Reach out today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start max-w-6xl mx-auto">
        {/* Contact Info Cards */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 font-heading">
              Workshop & Service Desk
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Customer Helpline</p>
                  <a
                    href="tel:+918090546021"
                    className="font-bold text-slate-900 hover:text-brand-600 text-base"
                  >
                    +91 8090546021
                  </a>
                  <p className="text-xs text-slate-500">24/7 call and WhatsApp support</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Official Email</p>
                  <a
                    href="mailto:alkarefrigeration@gmail.com"
                    className="font-bold text-slate-900 hover:text-brand-600 text-sm break-all"
                  >
                    alkarefrigeration@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Address</p>
                  <p className="font-semibold text-slate-800">
                    Babatpur, Varanasi, Uttar Pradesh, India
                  </p>
                  <p className="text-xs text-slate-500">Nearby Babatpur Airport Highway</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Operational Hours</p>
                  <p className="font-semibold text-slate-800">Mon – Sun: 8:00 AM – 9:00 PM</p>
                  <p className="text-xs text-slate-500">Open 7 days a week</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form / Map */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900 font-heading mb-4">
              Send an Inquiry
            </h3>

            {submitted ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base">Message Sent Successfully!</h4>
                <p className="text-xs text-emerald-700">
                  Thank you, {formData.name}. Our customer relationship team will call your number ({formData.phone}) shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="contact-name"
                  label="Your Name"
                  required
                  placeholder="e.g. Anand Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  id="contact-phone"
                  label="Contact Phone"
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Message / Query</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you need help with..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <Button type="submit" variant="primary" icon={Send} className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </div>

          {/* Interactive Location Map */}
          <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-sm h-64 bg-slate-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3602.8507249900604!2d82.84901649999999!3d25.443253700000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398fd5c1e7e66055%3A0x703f42e8547c7704!2sAlka%20Refrigeration!5e0!3m2!1sen!2sin!4v1777150873901!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Alka Refrigeration Google Map"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
