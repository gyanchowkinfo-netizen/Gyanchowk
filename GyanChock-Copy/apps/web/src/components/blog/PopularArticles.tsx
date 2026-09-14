'use client';

import { PageContainer } from '@/components/layout/Page';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion';
import type { BlogPost } from '@/lib/types';
import { ArticleCard } from './ArticleCard';

export function PopularArticles({ items }: { items: BlogPost[] }) {
  if (!items.length) return null;
  return (
    <section>
      <PageContainer>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Editor picks</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="mt-2 font-display text-3xl text-gc-black">Featured reads</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-2 max-w-xl text-sm text-gc-mute">
            Selected in the CMS. We do not invent view counts or popularity scores.
          </p>
        </Reveal>
        <StaggerContainer className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => (
            <StaggerItem key={post.slug}>
              <ArticleCard post={post} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageContainer>
    </section>
  );
}
