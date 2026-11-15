import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Home, Phone } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
      <span className="text-8xl font-black text-brand-100 font-heading select-none">404</span>
      <h2 className="text-3xl font-extrabold text-slate-900 font-heading -mt-6 mb-3">
        Page Not Found
      </h2>
      <p className="text-slate-600 text-sm mb-8 leading-relaxed">
        The page you are looking for might have been moved, renamed, or is temporarily unavailable. Let us help you find the right service.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/">
          <Button variant="primary">
            <Home className="w-4 h-4 mr-2 shrink-0" />
            Return to Home
          </Button>
        </Link>
        <Link href="/services">
          <Button variant="secondary">View Services</Button>
        </Link>
        <a href="tel:+918090546021">
          <Button variant="outline">
            <Phone className="w-4 h-4 mr-2 shrink-0" />
            Call Us
          </Button>
        </a>
      </div>
    </div>
  );
}
