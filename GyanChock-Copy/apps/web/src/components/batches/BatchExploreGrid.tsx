'use client';

import { AnimatePresence, motion } from 'motion/react';
import { PageContainer, SectionHeader } from '@/components/layout/Page';
import { EmptyState, ErrorState, Pagination } from '@/components/ui/States';
import { BatchCard } from '@/components/public/BatchCard';
import { useMotionPrefs } from '@/components/motion';
import { duration, ease } from '@/lib/motion';
import type { BatchCardData } from '@/lib/types';

export function BatchCardSkeleton() {
  return (
    <div className="gc-card overflow-hidden">
      <div className="h-40 animate-pulse bg-gc-navy" />
      <div className="space-y-3 p-5">
        <div className="h-4 animate-pulse rounded bg-gc-navy" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-gc-navy" />
      </div>
    </div>
  );
}

export function BatchExploreGrid({
  batches,
  loading,
  error,
  onRetry,
  onClear,
  page,
  pages,
  onPage,
}: {
  batches: BatchCardData[];
  loading: boolean;
  error?: string;
  onRetry: () => void;
  onClear: () => void;
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  const { reduce } = useMotionPrefs();
  return (
    <section id="all-batches">
      <PageContainer>
        <SectionHeader title="Explore all batches" />
        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <BatchCardSkeleton key={i} />
            ))}
          </div>
        ) : null}
        {error ? <ErrorState message={error} onRetry={onRetry} /> : null}
        {!loading && !error && !batches.length ? (
          <EmptyState
            title="No batches found"
            body="Try changing your filters or search."
            action={{ label: 'Clear filters', onClick: onClear }}
          />
        ) : null}
        {!loading && !error && batches.length ? (
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {batches.map((b, i) => (
                <motion.div
                  layout
                  key={b._id}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: 8 }}
                  transition={{ duration: duration.fast, delay: reduce ? 0 : (i % 3) * 0.05, ease: ease.smooth }}
                >
                  <BatchCard batch={b} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        ) : null}
        {!loading && !error ? <Pagination page={page} pages={pages} onPage={onPage} /> : null}
      </PageContainer>
    </section>
  );
}
