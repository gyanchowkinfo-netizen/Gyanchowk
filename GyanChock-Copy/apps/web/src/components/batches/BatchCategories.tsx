'use client';

import { BookOpen } from 'lucide-react';
import { PageContainer, SectionHeader } from '@/components/layout/Page';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/motion';
import type { BatchFacet } from '@/lib/types';

const blurb: Record<string, string> = {
  jee: 'Engineering entrance preparation with recorded paths.',
  neet: 'Medical entrance prep through structured recorded learning.',
  wbjee: 'State engineering exam programmes.',
  programming: 'Career-ready coding batches.',
};

export function BatchCategories({
  categories,
  onSelect,
}: {
  categories: BatchFacet[];
  onSelect: (name: string) => void;
}) {
  if (!categories.length) return null;
  return (
    <AnimatedSection>
      <PageContainer>
        <SectionHeader title="Batch categories" />
        <p className="-mt-3 mb-6 text-sm text-gc-mute">Counts come from open, upcoming and ongoing batches.</p>
        <StaggerContainer className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {categories.map((c) => (
            <StaggerItem key={c.name}>
              <button
                type="button"
                className="group gc-card flex w-full flex-col items-start gap-2 p-4 text-left transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-gc-gold/50"
                onClick={() => onSelect(c.name)}
              >
                <BookOpen className="text-gc-gold transition-transform duration-300 group-hover:scale-105" size={18} />
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-gc-mute">
                  {c.count} batch{c.count === 1 ? '' : 'es'}
                </span>
                <span className="text-xs text-gc-mist">
                  {blurb[c.name.toLowerCase()] ?? 'Focused recorded preparation for this track.'}
                </span>
              </button>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageContainer>
    </AnimatedSection>
  );
}
