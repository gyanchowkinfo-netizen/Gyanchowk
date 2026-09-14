import type { Metadata } from 'next';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'About',
  description:
    'Gyan Chowk is building a structured recorded-learning ecosystem that helps students learn, practice, improve and move toward their goals.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'Learning Should Have No Limits. | Gyan Chowk',
    description: 'A professional EdTech platform for recorded courses, batches, tests, doubts and career guidance.',
    url: '/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
