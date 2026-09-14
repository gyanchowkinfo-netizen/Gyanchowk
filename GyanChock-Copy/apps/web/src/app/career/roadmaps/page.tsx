import Link from 'next/link';
import { PageContainer, PageHeader, Breadcrumbs } from '@/components/layout/Page';
import { EmptyState } from '@/components/ui/States';
import { getCareerListing } from '@/lib/content';

export default async function RoadmapsPage() {
  const { roadmaps } = await getCareerListing();
  return (
    <PageContainer>
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/career', label: 'Career' }, { label: 'Roadmaps' }]} />
      <PageHeader title="Roadmaps" subtitle="Structured recorded-learning paths published by the career desk." />
      <div className="grid gap-4 md:grid-cols-2">
        {roadmaps.map((r) => (
          <Link key={r.slug} href={`/career/roadmaps/${r.slug}`} className="gc-card p-5 hover:border-gc-gold">
            <h2 className="font-display text-xl">{r.title}</h2>
            {r.description ? <p className="mt-2 text-sm text-gc-mute">{r.description}</p> : null}
          </Link>
        ))}
      </div>
      {!roadmaps.length ? <EmptyState title="No roadmaps published" /> : null}
    </PageContainer>
  );
}
