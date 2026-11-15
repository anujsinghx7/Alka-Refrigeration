import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BookingForm from '@/components/forms/BookingForm';
import Button from '@/components/ui/Button';
import {
  Phone,
  Calendar,
  ShieldCheck,
  Clock,
  Sparkles,
  CheckCircle,
  Wrench,
  Zap,
  Tag,
  Star,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

// Server-side data fetching for coupons demonstrating SSR / ISR
export const revalidate = 60; // ISR revalidation every 60 seconds

async function getPromotionalCoupons() {
  try {
    await connectDB();
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gte: now },
    })
      .sort({ discountValue: -1, discount: -1 })
      .limit(4)
      .lean();
    return JSON.parse(JSON.stringify(coupons));
  } catch (error) {
    console.warn('Note: Live coupons fallback active during build/offline:', error.message);
    return [
      {
        _id: 'default-1',
        code: 'SUMMER25',
        discountType: 'Percentage',
        discountValue: 25,
        serviceType: 'AC Repair',
        description: 'Flat 25% off on complete Split AC power jet service',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        _id: 'default-2',
        code: 'COOLING100',
        discountType: 'Flat',
        discountValue: 100,
        serviceType: 'Fridge Repair',
        description: '₹100 flat discount on refrigerator gas refilling',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    ];
  }
}

export default async function HomePage() {
  const coupons = await getPromotionalCoupons();

  const services = [
    {
      id: 'ac',
      title: 'AC Repair & Service',
      desc: 'Complete split & window AC deep jet cleaning, gas charging (R32, R410A), PCB repair, and installation.',
      image: '/assets/images/ac-repair.png',
      tags: ['Gas Refilling', 'Jet Cleaning', 'Installation', 'PCB Fix'],
    },
    {
      id: 'fridge',
      title: 'Refrigerator Repair',
      desc: 'Single door, double door, side-by-side & inverter fridge repair. Cooling coils, gas leakage & compressor specialists.',
      image: '/assets/images/fridge-repair.png',
      tags: ['Compressor', 'Thermostat', 'Gas Leak Fix', 'Cooling Problem'],
    },
    {
      id: 'washing-machine',
      title: 'Washing Machine Repair',
      desc: 'Top load, front load & semi-automatic washing machine repair. Drum vibration, drain motor, PCB & belt replacement.',
      image: '/assets/images/washing-machine-repair.png',
      tags: ['Drum Repair', 'Motor Fix', 'PCB Motherboard', 'Drain Issue'],
    },
    {
      id: 'deep-freezer',
      title: 'Deep Freezer Repair',
      desc: 'Commercial & domestic chest deep freezer repair. High cooling temperature control, gasket sealing & fan motor.',
      image: '/assets/images/deep-freezer-repair.png',
      tags: ['Commercial Freezer', 'Defrost System', 'Thermostat', 'Fan Motor'],
    },
    {
      id: 'water-cooler',
      title: 'Water Cooler Repair',
      desc: 'Industrial & commercial water cooler cooling overhaul, tank sanitization, tap replacement & compressor repair.',
      image: '/assets/images/water-cooler-repair.png',
      tags: ['Cooling Tank', 'Compressor', 'Tap Replacement', 'Maintenance'],
    },
    {
      id: 'amc',
      title: 'Annual Maintenance (AMC)',
      desc: 'Economical yearly service contracts for offices, hotels, hospitals & residences in Babatpur & Varanasi.',
      image: '/assets/images/services-collage.png',
      tags: ['Yearly Contract', 'Preventive Checkups', 'Priority Service'],
    },
  ];

  const trustStats = [
    { value: '10+', label: 'Years of Experience' },
    { value: '5,000+', label: 'Happy Customers' },
    { value: '30 Min', label: 'Doorstep Response' },
    { value: '100%', label: 'Genuine Spare Parts' },
  ];

  const whyChooseUs = [
    {
      title: 'Expert Certified Technicians',
      desc: 'Factory-trained HVAC engineers with years of hands-on diagnostic experience.',
      icon: Wrench,
    },
    {
      title: 'Same-Day Rapid Service',
      desc: 'Technicians dispatched across Babatpur & Varanasi with common parts in stock.',
      icon: Zap,
    },
    {
      title: 'Transparent Fair Pricing',
      desc: 'Clear upfront quotation before any work begins. No hidden charges or surprise fees.',
      icon: Tag,
    },
    {
      title: '100% Genuine Spare Parts',
      desc: 'Original manufacturer spares backed by warranty for long-term cooling performance.',
      icon: ShieldCheck,
    },
    {
      title: 'Doorstep Convenience',
      desc: 'Complete repair and maintenance carried out directly at your home or workplace.',
      icon: MapPin,
    },
    {
      title: '24/7 Customer Support',
      desc: 'Always available helpline for emergencies, bookings, and warranty queries.',
      icon: Phone,
    },
  ];

  const testimonials = [
    {
      name: 'Sunil Upadhyay',
      location: 'Babatpur, Varanasi',
      service: 'Split AC Gas Charging & Service',
      text: 'My AC stopped cooling in peak May heat. Alka Refrigeration technician arrived in 40 minutes, checked the gas pressure with digital gauges, refilled R32, and the AC is cooling like brand new. Highly recommended!',
      rating: 5,
    },
    {
      name: 'Pooja Srivastava',
      location: 'Shivpur, Varanasi',
      service: 'Double Door Fridge Repair',
      text: 'Our refrigerator compressor was making loud buzzing noise. They diagnosed a faulty relay and replaced it with genuine Whirlpool part at reasonable price. Honest and very professional service.',
      rating: 5,
    },
    {
      name: 'Vikas Mishra',
      location: 'Airport Road, Babatpur',
      service: 'Commercial Deep Freezer AMC',
      text: 'We run a confectionery near the airport. Alka Refrigeration has managed our deep freezers and milk coolers for over 3 years. Zero downtime and prompt response.',
      rating: 5,
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 bg-gradient-to-b from-brand-50/70 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Text */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 text-brand-800 text-xs sm:text-sm font-semibold shadow-xs">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>#1 Trusted Appliance Repair in Babatpur, Varanasi</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 font-heading tracking-tight leading-[1.15]">
                Expert Appliance <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-frost-600">
                  Repair at Your Doorstep
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                Quick, reliable AC, Refrigerator, Washing Machine & Deep Freezer repair services
                across Varanasi. Fast technician visits within 30 minutes. Trusted by 5,000+
                households.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/booking">
                  <Button variant="primary" size="lg" className="shadow-lg shadow-brand-600/25">
                    <Calendar className="w-4 h-4 mr-2 shrink-0" />
                    Book a Service Now
                  </Button>
                </Link>
                <a href="tel:+918090546021">
                  <Button variant="outline" size="lg">
                    <Phone className="w-4 h-4 mr-2 shrink-0" />
                    Call +91 8090546021
                  </Button>
                </a>
              </div>

              {/* Badges / Guarantees */}
              <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>30-Day Work Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Transparent Rates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Experts</span>
                </div>
              </div>
            </div>

            {/* Hero Right Banner Image */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                <Image
                  src="/assets/images/hero-banner.png"
                  alt="Alka Refrigeration Workshop & Technicians"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <p className="text-xs uppercase font-bold tracking-wider text-brand-300">
                      Alka Refrigeration Babatpur
                    </p>
                    <p className="text-lg font-bold font-heading">Complete Cooling Solutions</p>
                  </div>
                </div>
              </div>

              {/* Floating Stat Card */}
              <div className="hidden sm:flex absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 items-center gap-3.5 z-10 animate-bounce duration-1000">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
                  ★
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">4.9/5 Rating</p>
                  <p className="text-xs text-slate-500">Over 500+ Google Reviews</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST METRICS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-brand-800">
            {trustStats.map((stat, idx) => (
              <div key={idx} className={idx > 0 ? 'pt-4 md:pt-0' : ''}>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-black font-heading text-brand-300">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-300 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE SERVICES */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Our Expertise
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading mt-2">
            Professional Repair Services
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Top-rated maintenance, overhaul, and component repair for all major brands
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 font-heading group-hover:text-brand-600 transition">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {service.desc}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <Link href={`/booking?service=${encodeURIComponent(service.title)}`}>
                  <Button variant="outline" size="sm" className="w-full justify-between group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600">
                    <span>Book {service.title.split(' ')[0]}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SPECIAL PROMOTIONAL OFFERS */}
      {coupons && coupons.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-200 bg-white/10 px-3 py-1 rounded-full">
                  Special Savings
                </span>
                <h2 className="text-3xl font-extrabold font-heading mt-2">
                  Active Discount Coupons
                </h2>
                <p className="text-brand-100 text-sm mt-1">
                  Apply these discount codes during checkout or when paying online
                </p>
              </div>
              <Link href="/booking">
                <Button variant="secondary" size="md">
                  Claim Discount On Booking
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon._id}
                  className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-amber-400 text-slate-900">
                        {coupon.discountType === 'Flat'
                          ? `₹${coupon.discountValue} OFF`
                          : `${coupon.discountValue || coupon.discount}% OFF`}
                      </span>
                      <Tag className="w-4 h-4 text-brand-200" />
                    </div>
                    <p className="font-mono font-bold text-lg text-white tracking-wider">
                      {coupon.code}
                    </p>
                    <p className="text-xs text-brand-200 mt-1">{coupon.serviceType}</p>
                    {coupon.description && (
                      <p className="text-xs text-slate-200 mt-2 line-clamp-2">
                        {coupon.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 text-[11px] text-brand-200">
                    Valid till {new Date(coupon.expiryDate).toLocaleDateString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Why Alka Refrigeration
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading mt-2">
            The Alka Advantage
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Dependable refrigeration engineering with honest customer commitments
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChooseUs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:border-brand-300 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5 group-hover:bg-brand-600 group-hover:text-white transition">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 font-heading mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* WORK GALLERY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Our Work
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading mt-2">
            Quality Workmanship Gallery
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Real jobs delivered by our technicians on site across Varanasi
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="relative h-60 rounded-2xl overflow-hidden shadow-sm group">
            <Image
              src="/assets/images/ac-repair.png"
              alt="AC Installation"
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-end p-4 text-white text-sm font-bold">
              Split AC Overhaul
            </div>
          </div>
          <div className="relative h-60 rounded-2xl overflow-hidden shadow-sm group">
            <Image
              src="/assets/images/fridge-repair-original.png"
              alt="Refrigerator Service"
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-end p-4 text-white text-sm font-bold">
              Refrigerator Gas Charging
            </div>
          </div>
          <div className="relative h-60 rounded-2xl overflow-hidden shadow-sm group">
            <Image
              src="/assets/images/washing-machine.png"
              alt="Washing Machine Repair"
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-end p-4 text-white text-sm font-bold">
              Front Load Drum Servicing
            </div>
          </div>
          <div className="relative h-60 rounded-2xl overflow-hidden shadow-sm group">
            <Image
              src="/assets/images/deep-freezer.png"
              alt="Deep Freezer Service"
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-end p-4 text-white text-sm font-bold">
              Chest Deep Freezer Maintenance
            </div>
          </div>
          <div className="relative h-60 rounded-2xl overflow-hidden shadow-sm group">
            <Image
              src="/assets/images/water-cooler-repair-original.png"
              alt="Water Cooler Repair"
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-end p-4 text-white text-sm font-bold">
              Commercial Water Cooler Repair
            </div>
          </div>
          <div className="relative h-60 rounded-2xl overflow-hidden shadow-sm group">
            <Image
              src="/assets/images/gallary-collage.png"
              alt="Our Workshop & Team"
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-end p-4 text-white text-sm font-bold">
              Alka Refrigeration Service Team
            </div>
          </div>
        </div>
      </section>

      {/* CUSTOMER TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
            Reviews
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-heading mt-2">
            What Our Customers Say
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Trusted by home owners, shops, and businesses throughout Varanasi
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-700 italic leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                <p className="text-xs text-brand-600 font-medium">{t.service}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOOKING SECTION */}
      <section id="book-service" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <BookingForm />
      </section>
    </div>
  );
}
