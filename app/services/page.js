import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import {
  Wrench,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  Phone,
} from 'lucide-react';

export const metadata = {
  title: 'Our Services — AC, Fridge & Appliance Repair in Varanasi',
  description:
    'Comprehensive doorstep repair services for AC, Refrigerator, Washing Machine, Deep Freezer, and Water Cooler in Babatpur & Varanasi.',
};

export default function ServicesPage() {
  const serviceCatalog = [
    {
      id: 'ac-repair',
      name: 'AC Repair & Maintenance',
      image: '/assets/images/ac-repair.png',
      tagline: 'Split & Window AC Specialist',
      startingPrice: '₹349',
      features: [
        'Complete high-pressure power jet foam cleaning',
        'Refrigerant gas charging (R32, R410A, R22)',
        'PCB inverter board testing & repair',
        'Water leakage, copper pipe flare & insulation fix',
        'Compressor replacement with vacuum flushing',
      ],
      issues: ['No cooling or low cooling', 'Water dripping inside', 'Frequent tripping', 'Foul smell'],
    },
    {
      id: 'fridge-repair',
      name: 'Refrigerator Repair',
      image: '/assets/images/fridge-repair.png',
      tagline: 'Single, Double & Inverter Refrigerator',
      startingPrice: '₹299',
      features: [
        'Compressor relay & overload protector replacement',
        'Gas charging with copper filter drier renewal',
        'Defrost timer, bimetal thermostat & sensor repair',
        'Door gasket airtight sealing & door alignment',
        'Freezer ice buildup & fan motor replacement',
      ],
      issues: ['Freezer not freezing', 'Fridge body heating', 'Clicking noise', 'No power display'],
    },
    {
      id: 'washing-machine-repair',
      name: 'Washing Machine Repair',
      image: '/assets/images/washing-machine-repair.png',
      tagline: 'Front Load, Top Load & Semi-Automatic',
      startingPrice: '₹349',
      features: [
        'Drum bearing replacement & vibration dampening',
        'Water drain pump & inlet solenoid valve repair',
        'Motor carbon brushes & drive belt replacement',
        'Micro-controller PCB motherboard diagnosis',
        'Tub de-scaling & sanitization service',
      ],
      issues: ['Not spinning or draining', 'Loud shaking sound', 'Water not filling', 'Error code on LED'],
    },
    {
      id: 'deep-freezer-repair',
      name: 'Deep Freezer Repair',
      image: '/assets/images/deep-freezer-repair.png',
      tagline: 'Commercial & Domestic Chest Freezers',
      startingPrice: '₹499',
      features: [
        'Heavy duty compressor replacement & gas recharge',
        'Thermostat temperature calibration (-18°C to -24°C)',
        'Copper condenser coil leakage brazing',
        'Fan motor lubrication & blade balance',
      ],
      issues: ['Temperature rising', 'Excessive frost', 'Continuous running', 'Tripping MCB'],
    },
    {
      id: 'water-cooler-repair',
      name: 'Water Cooler Repair',
      image: '/assets/images/water-cooler-repair.png',
      tagline: 'Commercial, School & Hospital Coolers',
      startingPrice: '₹399',
      features: [
        'Cooling coil descaling & water tank sanitization',
        'Push tap, bib cock & drainage overhaul',
        'Compressor & condenser motor inspection',
        'Electrical wiring & float valve replacement',
      ],
      issues: ['Water not getting chilled', 'Leaking taps', 'Electric shock / earthing', 'Compressor hot'],
    },
    {
      id: 'amc-plans',
      name: 'Annual Maintenance Contract (AMC)',
      image: '/assets/images/services-collage.png',
      tagline: 'Preventive Care for Residential & Commercial',
      startingPrice: '₹1,499 / Year',
      features: [
        '3 scheduled comprehensive servicing visits per year',
        'Unlimited breakdown support with priority response',
        'Free gas pressure checks & electrical audits',
        'Special 20% discount on spare part replacements',
      ],
      issues: ['Prevent sudden breakdowns', 'Cut electricity consumption', 'Prolong appliance lifespan'],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3.5 py-1.5 rounded-full">
          All Services
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-heading">
          Expert Appliance Solutions
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          Complete cooling and home appliance services backed by transparent pricing, fast dispatch, and verified technicians.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {serviceCatalog.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-64 w-full bg-slate-100">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl font-bold text-sm text-slate-900 shadow-sm">
                  Starting {service.startingPrice}
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                    {service.tagline}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-900 font-heading mt-1">
                    {service.name}
                  </h3>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                    Scope of Work:
                  </h4>
                  <ul className="space-y-2">
                    {service.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                    Common Issues We Fix:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {service.issues.map((issue, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-0 flex gap-3">
              <Link
                href={`/booking?service=${encodeURIComponent(
                  service.name.includes('AMC') ? 'Annual Maintenance' : service.name.split(' ')[0] + ' ' + service.name.split(' ')[1]
                )}`}
                className="flex-1"
              >
                <Button variant="primary" size="md" className="w-full">
                  Book This Service
                </Button>
              </Link>
              <a href="tel:+918090546021">
                <Button variant="secondary" size="md">
                  <Phone className="w-4 h-4 mr-1.5 shrink-0" />
                  Call
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
