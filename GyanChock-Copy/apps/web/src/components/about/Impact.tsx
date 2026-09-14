'use client';

import { PageContainer } from '@/components/layout/Page';
import { CountUp, Reveal, StaggerContainer, StaggerItem } from '@/components/motion';
import type { PublicPlatformStats } from '@/lib/types';

export function Impact({ stats }: { stats?: PublicPlatformStats }) {
  if (!stats) return null;
  const items = [
    { label: 'Students', value: stats.students },
    { label: 'Courses', value: stats.courses },
    { label: 'Batches', value: stats.batches },
    { label: 'Teachers', value: stats.teachers },
  ].filter((item) => item.value > 0);
  if (!items.length) return null;
  return (
    <section id="impact">
      <PageContainer>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Impact</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="mt-2 font-display text-3xl text-gc-black">Numbers we can actually stand behind</h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-2 max-w-xl text-sm text-gc-mute">
            These counts come from the live catalogue. We do not invent learning hours or certificate totals.
          </p>
        </Reveal>
        <StaggerContainer className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <StaggerItem key={item.label}>
              <div className="gc-card p-6 text-center">
                <p className="font-display text-4xl text-gc-black">
                  <CountUp value={item.value} />
                </p>
                <p className="mt-2 text-sm text-gc-mute">{item.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageContainer>
    </section>
  );
}
