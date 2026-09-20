import type { Metadata } from 'next';
import { HomeExperience } from '@/components/home/HomeExperience';

export const metadata: Metadata = {
  title: 'Gyan Chowk — Structured Learning for Focused Progress',
  description:
    'Recorded courses, ranked tests, expert mentorship and structured learning — a quieter way to get smarter on Gyan Chowk.',
  openGraph: {
    title: 'Gyan Chowk — Structured Learning for Focused Progress',
    description: 'Recorded video learning, tests, doubts and mentorship without the live-class noise.',
    images: ['/g1.png'],
    type: 'website',
  },
};

export default function HomePage() {
  return <HomeExperience />;
}
