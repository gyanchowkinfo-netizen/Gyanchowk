import type { Metadata } from 'next';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Teachers',
  description:
    'Learn from approved Gyan Chowk teachers. Browse faculty for recorded courses, batches, tests and exam preparation.',
  alternates: { canonical: '/teachers' },
  openGraph: {
    title: 'Gyan Chowk Teachers',
    description: 'Approved faculty for recorded learning, batches and exam preparation.',
    url: '/teachers',
  },
};

export default function TeachersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
