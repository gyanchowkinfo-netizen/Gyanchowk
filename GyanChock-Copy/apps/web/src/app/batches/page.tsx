import { BatchesPageClient } from '@/components/batches/BatchesPageClient';
import { api } from '@/lib/api';
import type { BatchCardData } from '@/lib/types';

const APP = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function BatchesPage() {
  let names: BatchCardData[] = [];
  try {
    const data = await api<{ items: BatchCardData[] }>('/api/batches?limit=100');
    names = data.items ?? [];
  } catch {
    names = [];
  }
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Gyan Chowk Batches',
      url: `${APP}/batches`,
      itemListElement: names.map((b, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: b.name,
        url: `${APP}/batches/${b.slug}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: APP },
        { '@type': 'ListItem', position: 2, name: 'Batches', item: `${APP}/batches` },
      ],
    },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ul className="sr-only">
        {names.map((b) => (
          <li key={b._id}>
            {b.name}
            {b.targetExam ? ` — ${b.targetExam}` : ''}
          </li>
        ))}
      </ul>
      <BatchesPageClient />
    </>
  );
}
