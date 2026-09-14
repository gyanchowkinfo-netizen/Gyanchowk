'use client';

import { PageContainer } from '@/components/layout/Page';
import { EmptyState } from '@/components/ui/States';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion';
import type { BlogPost } from '@/lib/types';
import { ArticleCard } from './ArticleCard';

export function ArticleGrid({
  items,
  query,
  tag,
  loading,
}: {
  items: BlogPost[];
  query: string;
  tag: string;
  loading?: boolean;
}) {
  return (
    <section id="articles">
      <PageContainer>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Latest articles</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="mt-2 font-display text-3xl text-gc-black">
            {tag ? `Articles in ${tag}` : query ? `Results for “${query}”` : 'Fresh from the knowledge desk'}
          </h2>
        </Reveal>
        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="gc-card h-72 animate-pulse" />
            <div className="gc-card h-72 animate-pulse" />
            <div className="gc-card h-72 animate-pulse" />
          </div>
        ) : items.length ? (
          <StaggerContainer className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <StaggerItem key={post.slug}>
                <ArticleCard post={post} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="No articles found"
              body={query || tag ? 'Try another search or topic. Only published CMS articles are shown.' : 'Published blog posts will appear here.'}
            />
          </div>
        )}
      </PageContainer>
    </section>
  );
}
