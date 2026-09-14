'use client';

import { PageContainer } from '@/components/layout/Page';
import { AnimatedSection, CountUp, StaggerContainer, StaggerItem } from '@/components/motion';
import type { TeacherCatalogStats } from '@/lib/types';

export function TeacherStats({ stats }: { stats: TeacherCatalogStats | undefined }) {
  const items = [
    { label: 'Teachers', value: stats?.teachers ?? 0, digits: 0, suffix: '' },
    { label: 'Enrollments', value: stats?.enrollments ?? 0, digits: 0, suffix: '' },
    { label: 'Subjects taught', value: stats?.subjects ?? 0, digits: 0, suffix: '' },
    {
      label: 'Average rating',
      value: stats?.ratingCount ? stats.ratingAvg : 0,
      digits: 1,
      suffix: stats?.ratingCount ? '/5' : '',
    },
  ];
  return (
    <AnimatedSection>
      <PageContainer>
        <h2 className="text-center font-display text-3xl text-gc-black">Expert faculty</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-gc-mute">
          Live totals from approved teachers and their published courses. Empty values stay at zero until data exists.
        </p>
        <StaggerContainer className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <StaggerItem key={item.label}>
              <article className="gc-card p-6 text-center">
                <p className="font-display text-3xl text-gc-black">
                  {item.label === 'Average rating' && !stats?.ratingCount ? (
                    '—'
                  ) : (
                    <CountUp value={item.value} digits={item.digits} suffix={item.suffix} />
                  )}
                </p>
                <p className="mt-2 text-sm text-gc-mute">{item.label}</p>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageContainer>
    </AnimatedSection>
  );
}
