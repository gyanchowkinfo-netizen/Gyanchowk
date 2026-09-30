import { CareerPageClient } from '@/components/career/CareerPageClient';

const APP = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default function CareerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: APP },
      { '@type': 'ListItem', position: 2, name: 'Careers', item: `${APP}/career` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CareerPageClient />
    </>
  );
}
