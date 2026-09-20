import type { Metadata, Viewport } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { MobileBottomNavigation } from '@/components/layout/MobileBottomNavigation';
import { Providers } from '@/components/providers';
import { PageTransition } from '@/components/motion';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f6f4ee',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Gyan Chowk — Learn. Code. Grow.',
    template: '%s | Gyan Chowk',
  },
  description:
    'Gyan Chowk is a production e-learning platform for recorded courses, batches, tests, doubts, mentorship and career growth.',
  icons: { icon: '/g2.png', apple: '/g2.png' },
  openGraph: {
    title: 'Gyan Chowk — Learn. Code. Grow.',
    description: 'Recorded video learning, batches, tests and mentorship.',
    images: ['/g1.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gyan Chowk',
    images: ['/g1.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="overflow-x-hidden font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <AnnouncementBar />
          <Navbar />
          <PageTransition>{children}</PageTransition>
          <Footer />
          <MobileBottomNavigation />
        </Providers>
      </body>
    </html>
  );
}
