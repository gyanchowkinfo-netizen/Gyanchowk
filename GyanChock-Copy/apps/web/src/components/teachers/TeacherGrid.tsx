'use client';

import { AnimatePresence, motion } from 'motion/react';
import { PageContainer, SectionHeader } from '@/components/layout/Page';
import { EmptyState, ErrorState, Pagination } from '@/components/ui/States';
import { TeacherCard } from '@/components/public/TeacherCard';
import { useMotionPrefs } from '@/components/motion';
import { duration, ease } from '@/lib/motion';
import type { TeacherCardData } from '@/lib/types';

export function TeacherCardSkeleton() {
  return (
    <div className="gc-card h-72 animate-pulse p-5">
      <div className="mx-auto h-16 w-16 rounded-full bg-gc-navy" />
      <div className="mt-6 h-4 rounded bg-gc-navy" />
      <div className="mt-3 h-3 w-2/3 rounded bg-gc-navy" />
    </div>
  );
}

export function TeacherGrid({
  teachers,
  loading,
  error,
  onRetry,
  onClear,
  page,
  pages,
  onPage,
}: {
  teachers: TeacherCardData[];
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
    <section id="all-teachers">
      <PageContainer>
        <SectionHeader title="All teachers" />
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <TeacherCardSkeleton key={i} />
            ))}
          </div>
        ) : null}
        {error ? <ErrorState message={error} onRetry={onRetry} /> : null}
        {!loading && !error && !teachers.length ? (
          <EmptyState
            title="No teachers found"
            body="Try changing your search or filters."
            action={{ label: 'Clear filters', onClick: onClear }}
          />
        ) : null}
        {!loading && !error && teachers.length ? (
          <AnimatePresence mode="popLayout">
            <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {teachers.map((t, i) => (
                <motion.div
                  layout
                  key={t._id}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, y: 8 }}
                  transition={{ duration: duration.fast, delay: reduce ? 0 : (i % 3) * 0.05, ease: ease.smooth }}
                >
                  <TeacherCard teacher={t} />
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
