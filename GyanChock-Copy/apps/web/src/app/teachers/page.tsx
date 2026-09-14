import { TeachersPageClient } from '@/components/teachers/TeachersPageClient';
import { api } from '@/lib/api';
import type { TeacherCardData } from '@/lib/types';

const APP = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function TeachersPage() {
  let names: TeacherCardData[] = [];
  try {
    const data = await api<{ items: TeacherCardData[] }>('/api/catalog/teachers?limit=100');
    names = data.items ?? [];
  } catch {
    names = [];
  }
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Gyan Chowk Teachers',
      url: `${APP}/teachers`,
      itemListElement: names.map((t, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: t.name,
        url: `${APP}/teachers/${t._id}`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: APP },
        { '@type': 'ListItem', position: 2, name: 'Teachers', item: `${APP}/teachers` },
      ],
    },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ul className="sr-only">
        {names.map((t) => (
          <li key={t._id}>
            {t.name}
            {t.headline ? ` — ${t.headline}` : ''}
          </li>
        ))}
      </ul>
      <TeachersPageClient />
    </>
  );
}
