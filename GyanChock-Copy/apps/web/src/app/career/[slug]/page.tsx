import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageContainer, Breadcrumbs } from '@/components/layout/Page';
import { CoverMedia } from '@/components/public/CoverMedia';
import { ScrollProgress } from '@/components/motion';
import { getCareerArticle } from '@/lib/content';
import { formatDate, readingMinutes } from '@/lib/format';
import { staticParams } from '@/lib/static-params';

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = 120;

export function generateStaticParams() {
  return staticParams('/api/career/articles?limit=200');
}

const APP = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCareerArticle(slug);
  if (!data?.item) {
    return { title: 'Career article', robots: { index: false } };
  }
  const title = data.item.seoTitle || data.item.title;
  const description = data.item.seoDescription || data.item.excerpt || 'Career guidance from Gyan Chowk.';
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `/career/${slug}` },
    openGraph: {
      title,
      description,
      url: `/career/${slug}`,
      type: 'article',
      images: data.item.cover?.url ? [data.item.cover.url] : ['/g1.png'],
    },
  };
}

export default async function CareerArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCareerArticle(slug);
  if (!data?.item) notFound();
  const item = data.item;
  const related = data.related ?? [];
  const mins = readingMinutes(`${item.excerpt ?? ''} ${item.body ?? ''}`);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: item.title,
    description: item.excerpt,
    datePublished: item.createdAt,
    dateModified: item.updatedAt,
    image: item.cover?.url,
    url: `${APP}/career/${slug}`,
    publisher: { '@type': 'Organization', name: 'Gyan Chowk' },
  };
  return (
    <PageContainer>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ScrollProgress />
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { href: '/career', label: 'Career' }, { label: item.title }]} />
      {item.category ? <p className="text-xs uppercase tracking-widest text-gc-glow">{item.category}</p> : null}
      <h1 className="mt-2 font-display text-4xl text-gc-black md:text-5xl">{item.title}</h1>
      {item.excerpt ? <p className="mt-4 max-w-3xl text-lg text-gc-mist">{item.excerpt}</p> : null}
      <p className="mt-3 text-sm text-gc-mute">
        {[formatDate(item.createdAt), `${mins} min read`].filter(Boolean).join(' · ')}
      </p>
      {item.cover?.url ? (
        <div className="relative mt-8 aspect-[16/8] overflow-hidden rounded-3xl border border-gc-line">
          <CoverMedia src={item.cover.url} alt={item.title} sizes="(max-width: 1024px) 100vw, 960px" />
        </div>
      ) : null}
      <article className="mt-8 max-w-3xl whitespace-pre-wrap text-gc-mist">{item.body}</article>
      {related.length ? (
        <section className="mt-12">
          <h2 className="font-display text-2xl text-gc-black">Related articles</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug} className="gc-card p-4">
                <Link href={`/career/${r.slug}`} className="font-display hover:text-gc-gold">
                  {r.title}
                </Link>
                {r.excerpt ? <p className="mt-1 text-sm text-gc-mute">{r.excerpt}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </PageContainer>
  );
}
