import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import QueryProvider from '@/components/providers/QueryProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import WhatsAppButton from '@/components/layout/WhatsAppButton';
import BottomNav from '@/components/layout/BottomNav';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Alka Refrigeration — AC, Fridge & Home Appliance Repair | Babatpur, Varanasi',
    template: '%s | Alka Refrigeration',
  },
  description:
    'Expert AC, Refrigerator, Washing Machine, Deep Freezer & Water Cooler repair services in Babatpur, Varanasi. Quick doorstep visits within 30 minutes, affordable pricing & genuine spare parts.',
  keywords: [
    'AC repair Varanasi',
    'fridge repair Babatpur',
    'washing machine repair Varanasi',
    'deep freezer service',
    'water cooler repair',
    'Alka Refrigeration',
    'air conditioning maintenance Babatpur',
  ],
  authors: [{ name: 'Alka Refrigeration' }],
  icons: {
    icon: '/assets/images/alka logo.png',
  },
  openGraph: {
    title: 'Alka Refrigeration — Expert Appliance Repair in Babatpur, Varanasi',
    description:
      'Quick & reliable AC, Fridge, Washing Machine repair in Babatpur, Varanasi. Trusted by 5000+ customers.',
    url: 'https://alka-refrigeration.vercel.app',
    siteName: 'Alka Refrigeration',
    images: [
      {
        url: '/assets/images/alka logo.png',
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#0284c7',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" type="image/png" href="/assets/images/alka logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-slate-50 text-slate-800">
        <AuthProvider>
          <QueryProvider>
            <Navbar />
            <div className="flex-1 pt-20 pb-16 md:pb-0">{children}</div>
            <Footer />
            <WhatsAppButton />
            <BottomNav />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
