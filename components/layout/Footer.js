import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, Clock, Shield, Award, Wrench } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center">
                <Image
                  src="/assets/images/alka logo.png"
                  alt="Alka Refrigeration"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-extrabold text-white font-heading tracking-tight">
                ALKA <span className="text-brand-400">REFRIGERATION</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Varanasi’s premier doorstep appliance repair & cooling service provider with over
              10+ years of proven expertise. Quick, transparent, and trusted by 5000+ homes and
              businesses.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-brand-400" />
                Verified Technicians
              </span>
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-brand-400" />
                Genuine Parts
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 font-heading">Quick Navigation</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-brand-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-brand-400 transition">
                  About Alka Refrigeration
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-brand-400 transition">
                  All Repair Services
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-brand-400 transition">
                  Spare Parts & Cooling Units
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-brand-400 transition">
                  Book Doorstep Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-400 transition">
                  Contact Us & Location
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 font-heading">Contact Details</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <div>
                  <a
                    href="tel:+918090546021"
                    className="hover:text-brand-400 transition font-medium"
                  >
                    +91 8090546021
                  </a>
                  <p className="text-xs text-slate-400">Available 24/7 for booking</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <a
                  href="mailto:alkarefrigeration@gmail.com"
                  className="hover:text-brand-400 transition"
                >
                  alkarefrigeration@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <span>Babatpur, Varanasi, Uttar Pradesh, India</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <span>Mon – Sun: 8:00 AM – 9:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Location Map */}
          <div>
            <h4 className="text-white font-bold text-base mb-4 font-heading">Our Service Area</h4>
            <div className="rounded-xl overflow-hidden border border-slate-700 h-44 shadow-inner">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3602.8507249900604!2d82.84901649999999!3d25.443253700000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398fd5c1e7e66055%3A0x703f42e8547c7704!2sAlka%20Refrigeration!5e0!3m2!1sen!2sin!4v1777150873901!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Alka Refrigeration Location"
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">Serving Babatpur, Varanasi & surrounding areas</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2024–2026 Alka Refrigeration 2.0. All rights reserved.</p>
          <p className="text-slate-400">
            Engineered with Next.js App Router, React & Tailwind CSS • INT252 & INT257 Capstone
          </p>
        </div>
      </div>
    </footer>
  );
}
