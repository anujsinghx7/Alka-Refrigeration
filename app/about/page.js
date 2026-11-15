import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import {
  Wrench,
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  Users,
  Award,
} from 'lucide-react';

export const metadata = {
  title: 'About Us — 10+ Years of Appliance Repair Expertise',
  description:
    'Learn about Alka Refrigeration in Babatpur, Varanasi. Over a decade of expert AC, Refrigerator, and home appliance repair with verified technicians.',
};

export default function AboutPage() {
  const milestones = [
    { year: '2014', title: 'Founded in Babatpur', desc: 'Started as a local cooling workshop.' },
    { year: '2017', title: 'Expanded to Full Varanasi', desc: 'Doorstep mobile service launched.' },
    { year: '2021', title: '5,000+ Services Milestone', desc: 'Trusted by residential & commercial clients.' },
    { year: '2026', title: 'Alka Refrigeration 2.0', desc: 'Digital booking, live tracking & online payment.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3.5 py-1.5 rounded-full">
          Company Profile
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-heading">
          Your Trusted Cooling & Appliance Partner
        </h1>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          For more than 10 years, Alka Refrigeration has delivered honest, professional, and fast doorstep appliance repairs across Babatpur and Varanasi.
        </p>
      </div>

      {/* Main Story & Image */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative h-96 sm:h-[450px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
          <Image
            src="/assets/images/hero-banner.png"
            alt="Alka Refrigeration Babatpur Facility"
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-heading">
            Dedicated to Fast, Reliable & Honest Workmanship
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            At <strong>Alka Refrigeration</strong>, we know that when your air conditioner or refrigerator breaks down in extreme weather, you need quick, dependable assistance. We avoid unnecessary part replacements and focus on precise diagnostics.
          </p>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            From single-door refrigerators to heavy-duty industrial deep freezers, chillers, and centralized AC systems, our team handles every repair with calibrated equipment and genuine parts.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <span className="text-2xl font-black text-brand-600 font-heading">5000+</span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Repairs Completed</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200">
              <span className="text-2xl font-black text-brand-600 font-heading">30 Min</span>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Average Response Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-900 font-heading mb-8 text-center">
          Our Journey & Milestones
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-3xl font-extrabold text-brand-600 font-heading block mb-2">
                {m.year}
              </span>
              <h4 className="text-base font-bold text-slate-900">{m.title}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team CTA */}
      <div className="bg-brand-900 rounded-3xl p-8 sm:p-12 text-white text-center max-w-4xl mx-auto shadow-xl space-y-6">
        <h3 className="text-2xl sm:text-3xl font-extrabold font-heading">
          Need Quick Help with Your Appliance?
        </h3>
        <p className="text-slate-300 text-sm max-w-xl mx-auto">
          Our technicians are on duty right now. Book online or call directly for immediate emergency repair assistance.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/booking">
            <Button variant="primary" size="lg" className="bg-brand-500 hover:bg-brand-600">
              Book Doorstep Technician
            </Button>
          </Link>
          <a href="tel:+918090546021">
            <Button variant="outline" size="lg" className="text-white border-white/40 hover:bg-white/10">
              Call +91 8090546021
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
