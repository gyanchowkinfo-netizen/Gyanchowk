import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Sora } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { MobileBottomNavigation } from '@/components/layout/MobileBottomNavigation';
import { Providers } from '@/components/providers';
import { PageTransition } from '@/components/motion';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
});
const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
});

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
    <html lang="en" className={`${jakarta.variable} ${sora.variable}`}>
      <body className="font-sans antialiased">
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
