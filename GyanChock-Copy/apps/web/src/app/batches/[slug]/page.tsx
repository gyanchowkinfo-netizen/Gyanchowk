import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { BatchDetailView } from '@/components/batches/BatchDetailView';
import type { BatchCardData } from '@/lib/types';
import { staticParams } from '@/lib/static-params';

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = 120;

export function generateStaticParams() {
  return staticParams('/api/batches?limit=200');
}

const APP = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const loadBatch = cache(async (slug: string) =>
  api<{ batch: BatchCardData }>(`/api/batches/${slug}`),
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const data = await loadBatch(slug);
    const b = data.batch;
    const description = (b.description || `Join ${b.name} on Gyan Chowk.`).slice(0, 160);
    return {
      title: b.name,
      description,
      alternates: { canonical: `/batches/${slug}` },
      openGraph: {
        title: `${b.name} | Gyan Chowk`,
        description,
        url: `/batches/${slug}`,
        images: b.thumbnail?.url ? [b.thumbnail.url] : ['/g1.png'],
      },
    };
  } catch {
    return { title: 'Batch', robots: { index: false, follow: true } };
  }
}

export default async function BatchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const data = await loadBatch(slug);
    const b = data.batch;
    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: b.name,
        description: b.description,
        url: `${APP}/batches/${b.slug}`,
        provider: { '@type': 'EducationalOrganization', name: 'Gyan Chowk', url: APP },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: APP },
          { '@type': 'ListItem', position: 2, name: 'Batches', item: `${APP}/batches` },
          { '@type': 'ListItem', position: 3, name: b.name, item: `${APP}/batches/${b.slug}` },
        ],
      },
    ];
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <BatchDetailView slug={slug} />
      </>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    if (/not found/i.test(message)) notFound();
    return <BatchDetailView slug={slug} />;
  }
}
