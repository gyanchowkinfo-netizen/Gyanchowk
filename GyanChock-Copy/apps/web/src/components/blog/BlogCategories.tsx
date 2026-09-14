'use client';

import { PageContainer } from '@/components/layout/Page';
import { Reveal, StaggerContainer, StaggerItem, TiltCard } from '@/components/motion';
import type { BlogTag } from '@/lib/types';

export function BlogCategories({
  tags,
  active,
  onSelect,
}: {
  tags: BlogTag[];
  active: string;
  onSelect: (name: string) => void;
}) {
  if (!tags.length) return null;
  return (
    <section id="topics">
      <PageContainer>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Categories</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="mt-2 font-display text-3xl text-gc-black">Learn by topic</h2>
        </Reveal>
        <StaggerContainer className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <StaggerItem key={tag.name}>
              <TiltCard intensity={4}>
                <button
                  type="button"
                  onClick={() => onSelect(tag.name === active ? '' : tag.name)}
                  className={`gc-card w-full p-5 text-left hover:border-gc-gold ${active === tag.name ? 'border-gc-gold' : ''}`}
                  aria-pressed={active === tag.name}
                >
                  <h3 className="font-display text-lg">{tag.name}</h3>
                  <p className="mt-1 text-sm text-gc-mute">
                    {tag.count} article{tag.count === 1 ? '' : 's'}
                  </p>
                </button>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageContainer>
    </section>
  );
}
