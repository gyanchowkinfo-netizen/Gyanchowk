import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Career roadmaps',
  description: 'Structured recorded-learning roadmaps from Gyan Chowk.',
  alternates: { canonical: '/career/roadmaps' },
};

export default function RoadmapsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
