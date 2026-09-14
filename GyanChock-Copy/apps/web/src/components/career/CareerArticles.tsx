'use client';

import Link from 'next/link';
import { PageContainer } from '@/components/layout/Page';
import { CoverMedia } from '@/components/public/CoverMedia';
import { EmptyState } from '@/components/ui/States';
import { Reveal, StaggerContainer, StaggerItem, TiltCard } from '@/components/motion';
import { formatDate, readingMinutes } from '@/lib/format';
import type { CareerArticle } from '@/lib/types';

export function CareerArticleCard({ article }: { article: CareerArticle }) {
  const mins = readingMinutes(`${article.excerpt ?? ''} ${article.body ?? ''}`);
  return (
    <TiltCard intensity={4} className="h-full">
      <Link href={`/career/${article.slug}`} className="gc-card group flex h-full flex-col overflow-hidden p-0 hover:border-gc-gold">
        <div className="relative h-40 overflow-hidden">
          <CoverMedia src={article.cover?.url} alt="" className="transition-transform duration-300 group-hover:scale-[1.04]" />
        </div>
        <div className="flex flex-1 flex-col p-5">
          {article.category ? <p className="text-xs uppercase tracking-widest text-gc-glow">{article.category}</p> : null}
          <h3 className="mt-2 font-display text-lg group-hover:text-gc-gold">{article.title}</h3>
          {article.excerpt ? <p className="mt-2 line-clamp-2 flex-1 text-sm text-gc-mute">{article.excerpt}</p> : null}
          <p className="mt-4 text-xs text-gc-mute">
            {[formatDate(article.createdAt), `${mins} min read`].filter(Boolean).join(' · ')}
          </p>
          <span className="mt-3 text-sm text-gc-glow">Read article →</span>
        </div>
      </Link>
    </TiltCard>
  );
}

export function CareerArticles({
  items,
  category,
  onClear,
  loading,
}: {
  items: CareerArticle[];
  category: string;
  onClear: () => void;
  loading?: boolean;
}) {
  const shown = items.slice(0, 6);
  return (
    <section id="articles">
      <PageContainer>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Career articles</p>
            </Reveal>
            <Reveal delay={0.04}>
              <h2 className="mt-2 font-display text-3xl text-gc-black">
                {category ? `Guides in ${category}` : 'Featured career articles'}
              </h2>
            </Reveal>
          </div>
          {category ? (
            <button type="button" className="text-sm text-gc-glow hover:underline" onClick={onClear}>
              Show all
            </button>
          ) : null}
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="gc-card h-64 animate-pulse" />
            <div className="gc-card h-64 animate-pulse" />
            <div className="gc-card h-64 animate-pulse" />
          </div>
        ) : shown.length ? (
          <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {shown.map((article) => (
              <StaggerItem key={article.slug}>
                <CareerArticleCard article={article} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <EmptyState
            title="No career articles yet"
            body="Published career guides from the CMS will appear here. Nothing is invented."
          />
        )}
      </PageContainer>
    </section>
  );
}
