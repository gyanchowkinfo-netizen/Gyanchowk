import type { Metadata } from 'next';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Careers at Gyan Chowk | Join Our Team',
  description:
    'Explore career opportunities at Gyan Chowk and join a team building meaningful learning experiences.',
  alternates: { canonical: '/career' },
  openGraph: {
    title: 'Careers at Gyan Chowk | Join Our Team',
    description: 'Explore career opportunities at Gyan Chowk and join a team building meaningful learning experiences.',
    url: '/career',
  },
};

export default function CareerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
