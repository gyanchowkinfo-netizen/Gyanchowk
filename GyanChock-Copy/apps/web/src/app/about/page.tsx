import { AboutPageClient } from '@/components/about/AboutPageClient';
import { cmsBody, getPublicCms } from '@/lib/content';

const APP = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export default async function AboutPage() {
  const cms = await getPublicCms();
  const about = cmsBody(cms.pages, 'about');
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Gyan Chowk',
      url: APP,
      logo: `${APP}/g1.png`,
      description:
        about?.body ||
        'Gyan Chowk is a recorded e-learning platform for courses, batches, tests, doubts, mentorship and career growth.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: APP },
        { '@type': 'ListItem', position: 2, name: 'About', item: `${APP}/about` },
      ],
    },
  ];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="sr-only">
        {about?.body ||
          'Gyan Chowk is building a structured learning ecosystem that helps students learn, practice, improve and move toward their goals.'}
      </p>
      <AboutPageClient pages={cms.pages ?? []} stats={cms.stats} />
    </>
  );
}
