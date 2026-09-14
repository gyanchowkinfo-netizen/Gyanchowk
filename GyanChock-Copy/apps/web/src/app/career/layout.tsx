import type { Metadata } from 'next';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Career',
  description:
    'Explore Gyan Chowk career paths, recorded-learning roadmaps and practical resources that help students move from learning to opportunity.',
  alternates: { canonical: '/career' },
  openGraph: {
    title: 'Build Skills. Shape Your Future. | Gyan Chowk',
    description: 'Career paths, learning roadmaps and resources from Gyan Chowk.',
    url: '/career',
  },
};

export default function CareerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
