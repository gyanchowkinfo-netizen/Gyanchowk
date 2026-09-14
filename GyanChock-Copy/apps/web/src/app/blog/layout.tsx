import type { Metadata } from 'next';

export const revalidate = 120;

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Explore insights, guides, career advice, exam preparation strategies and educational resources from Gyan Chowk.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Ideas That Help You Learn Better. | Gyan Chowk',
    description: 'Guides and educational resources from the Gyan Chowk knowledge desk.',
    url: '/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
