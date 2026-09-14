'use client';

import { PageContainer, SectionHeader } from '@/components/layout/Page';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/motion';
import { BatchCard } from '@/components/public/BatchCard';
import type { BatchCardData } from '@/lib/types';

export function FeaturedBatches({ batches }: { batches: BatchCardData[] }) {
  if (!batches.length) return null;
  return (
    <AnimatedSection>
      <PageContainer>
        <SectionHeader title="Featured batches" />
        <p className="-mt-3 mb-6 max-w-2xl text-sm text-gc-mute">
          Structured programs designed for focused preparation — ranked from current enrollments on Gyan Chowk.
        </p>
        <StaggerContainer className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {batches.map((b) => (
            <StaggerItem key={b._id} className="h-full">
              <BatchCard batch={b} featured />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageContainer>
    </AnimatedSection>
  );
}
