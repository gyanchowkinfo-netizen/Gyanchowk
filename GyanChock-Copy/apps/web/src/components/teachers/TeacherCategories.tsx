'use client';

import { BookMarked } from 'lucide-react';
import { PageContainer, SectionHeader } from '@/components/layout/Page';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/motion';
import type { TeacherFacet } from '@/lib/types';

export function TeacherCategories({
  categories,
  onSelect,
}: {
  categories: TeacherFacet[];
  onSelect: (name: string) => void;
}) {
  if (!categories.length) return null;
  return (
    <AnimatedSection>
      <PageContainer>
        <SectionHeader title="Teacher categories" />
        <p className="-mt-3 mb-6 text-sm text-gc-mute">Counts come from published courses assigned to approved teachers.</p>
        <StaggerContainer className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((c) => (
            <StaggerItem key={c.name}>
              <button
                type="button"
                className="group gc-card flex w-full items-center gap-3 p-4 text-left transition-[transform,background-color] duration-300 hover:-translate-y-1 hover:border-gc-gold/50"
                onClick={() => onSelect(c.name)}
              >
                <BookMarked className="shrink-0 text-gc-gold transition-transform duration-300 group-hover:scale-105" size={18} />
                <span>
                  <span className="block font-medium">{c.name}</span>
                  <span className="text-xs text-gc-mute">{c.count} teacher{c.count === 1 ? '' : 's'}</span>
                </span>
              </button>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageContainer>
    </AnimatedSection>
  );
}
