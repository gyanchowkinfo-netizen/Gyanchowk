import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageContainer, Breadcrumbs } from '@/components/layout/Page';
import { RoadmapTimeline } from '@/components/motion/RoadmapTimeline';
import { ScrollProgress } from '@/components/motion';
import { getCareerRoadmap } from '@/lib/content';
import { staticParams } from '@/lib/static-params';

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = 120;

export function generateStaticParams() {
  return staticParams('/api/career/roadmaps?limit=200');
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCareerRoadmap(slug);
  if (!data?.item) return { title: 'Roadmap', robots: { index: false } };
  return {
    title: data.item.title,
    description: data.item.description || 'A Gyan Chowk recorded-learning roadmap.',
    alternates: { canonical: `/career/roadmaps/${slug}` },
    openGraph: { title: data.item.title, description: data.item.description, url: `/career/roadmaps/${slug}` },
  };
}

export default async function RoadmapDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCareerRoadmap(slug);
  if (!data?.item) notFound();
  const item = data.item;
  const steps = [...(item.steps ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return (
    <PageContainer>
      <ScrollProgress />
      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { href: '/career', label: 'Career' },
          { href: '/career/roadmaps', label: 'Roadmaps' },
          { label: item.title },
        ]}
      />
      <h1 className="font-display text-4xl text-gc-black">{item.title}</h1>
      {item.description ? <p className="mt-3 max-w-3xl text-gc-mist">{item.description}</p> : null}
      <div className="mt-8">
        <RoadmapTimeline steps={steps.map((s) => ({ title: s.title, body: s.body }))} />
      </div>
    </PageContainer>
  );
}
