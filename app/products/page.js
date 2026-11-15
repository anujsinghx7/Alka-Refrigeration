import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Shield, Check, Phone, ArrowRight, Tag } from 'lucide-react';

export const metadata = {
  title: 'Products & Genuine Spare Parts — Alka Refrigeration',
  description:
    'Browse genuine refrigeration spare parts, compressors, refrigerants, and commercial cooling appliances in Babatpur, Varanasi.',
};

export default function ProductsPage() {
  const products = [
    {
      id: 'compressors',
      title: 'Rotary & Reciprocating Compressors',
      category: 'Core Components',
      image: '/assets/images/fridge-repair-original.png',
      brands: 'Godrej, LG, Emerson, Tecumseh',
      description: 'Energy-efficient inverter and non-inverter compressors for split ACs, domestic refrigerators, and deep freezers.',
      availability: 'In Stock • 1 Year Warranty',
    },
    {
      id: 'refrigerants',
      title: 'Eco-Friendly Refrigerant Cylinders',
      category: 'Gases & Refills',
      image: '/assets/images/ac-repair.png',
      brands: 'Floron, Chemours, Honeywell',
      description: 'High-purity R32, R410A, R134a, and R600a refrigerants guaranteed to deliver optimal cooling COP and zero cylinder contamination.',
      availability: '100% Pure Virgin Gas',
    },
    {
      id: 'washing-machine-spares',
      title: 'Washing Machine Motors & Gearboxes',
      category: 'Assemblies',
      image: '/assets/images/washing-machine.png',
      brands: 'Whirlpool, Samsung, IFB, Bosch',
      description: 'Original wash & spin motors, pulsation gearboxes, drain pumps, and micro-controller PCB display boards.',
      availability: 'OEM Factory Spares',
    },
    {
      id: 'thermostats-pcb',
      title: 'Universal Inverter Motherboards & Sensors',
      category: 'Electronics',
      image: '/assets/images/services-collage.png',
      brands: 'OEM & Universal Kits',
      description: 'Digital temperature sensors, defrost bimetals, capillary expansion assemblies, and multi-speed indoor fan motors.',
      availability: 'Pre-Tested Quality',
    },
    {
      id: 'water-cooler-units',
      title: 'Commercial Water Cooler Systems',
      category: 'Cooling Units',
      image: '/assets/images/water-cooler-repair-original.png',
      brands: 'Blue Star, Voltas, Alka Custom',
      description: 'Heavy gauge food-grade SS-304 water coolers with fast-chill cooling tanks for factories, schools, and transit hubs.',
      availability: 'Custom Capacities 40L to 300L',
    },
    {
      id: 'deep-freezers-commercial',
      title: 'Chest Deep Freezers & Visi-Coolers',
      category: 'Commercial Freezers',
      image: '/assets/images/deep-freezer.png',
      brands: 'Voltas, Western, Rockwell',
      description: 'Hard-top and curved-glass visi-coolers and deep freezers for ice cream, frozen foods, dairy, and cold beverages.',
      availability: 'Available on Order',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3.5 py-1.5 rounded-full">
          Parts & Equipment
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-heading">
          Genuine Spare Parts & Appliances
        </h1>
        <p className="text-slate-600 text-base sm:text-lg">
          We use and supply only certified, original equipment manufacturer (OEM) parts to ensure your cooling appliances run at peak efficiency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-56 w-full bg-slate-100">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg font-medium">
                  {item.category}
                </span>
              </div>
              <div className="p-6 space-y-3">
                <h3 className="text-xl font-bold text-slate-900 font-heading">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-brand-600">
                  Brands: {item.brands}
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium pt-2">
                  <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item.availability}</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-2">
              <Link href="/booking" className="flex-1">
                <Button variant="primary" size="sm" className="w-full">
                  Request Part / Fitting
                </Button>
              </Link>
              <a href="tel:+918090546021">
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-1.5 shrink-0" />
                  Price
                </Button>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
