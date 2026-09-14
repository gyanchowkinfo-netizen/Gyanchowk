import { CareerPageClient } from '@/components/career/CareerPageClient';
import { getCareerListing } from '@/lib/content';

const APP = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function CareerPage() {
  const data = await getCareerListing();
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Gyan Chowk Career Resources',
      url: `${APP}/career`,
      itemListElement: [
        ...data.roadmaps.map((r, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: r.title,
          url: `${APP}/career/roadmaps/${r.slug}`,
        })),
        ...data.articles.map((a, i) => ({
          '@type': 'ListItem',
          position: data.roadmaps.length + i + 1,
          name: a.title,
          url: `${APP}/career/${a.slug}`,
        })),
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: APP },
        { '@type': 'ListItem', position: 2, name: 'Career', item: `${APP}/career` },
      ],
    },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ul className="sr-only">
        {data.roadmaps.map((r) => (
          <li key={r.slug}>{r.title}</li>
        ))}
        {data.articles.map((a) => (
          <li key={a.slug}>{a.title}</li>
        ))}
      </ul>
      <CareerPageClient />
    </>
  );
}
