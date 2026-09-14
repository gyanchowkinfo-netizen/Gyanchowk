import type { Metadata } from 'next';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Batches',
  description:
    'Find structured Gyan Chowk batches for recorded learning, tests, doubts and exam preparation. No live classes.',
  alternates: { canonical: '/batches' },
  openGraph: {
    title: 'Gyan Chowk Batches',
    description: 'Structured recorded programmes with schedule, tests and verified enrollment.',
    url: '/batches',
  },
};

export default function BatchesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
