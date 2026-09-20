'use client';

import { HeartHandshake, Infinity as LoopIcon, Lightbulb, ShieldCheck, Sparkles, Target, TrendingUp, Users } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion';
import { CardIcon, CARD_ICON_CYCLE } from '@/components/ui/CardIcon';

const values = [
  { icon: Users, title: 'Student first', body: 'Product decisions start with learner outcomes, not spectacle.' },
  { icon: Sparkles, title: 'Quality learning', body: 'Recorded lessons, tests and materials stay enrollment-gated and verified.' },
  { icon: HeartHandshake, title: 'Accessibility', body: 'Learn on your schedule, with recorded lessons you can pause and resume.' },
  { icon: Target, title: 'Consistency', body: 'Batches, attendance and backlog planning keep effort visible.' },
  { icon: Lightbulb, title: 'Innovation', body: 'Analytics, ranks and doubts improve how students actually study.' },
  { icon: ShieldCheck, title: 'Trust', body: 'Payments, certificates and access are decided on the server.' },
  { icon: TrendingUp, title: 'Performance', body: 'The pages should stay fast. Motion never blocks learning.' },
  { icon: LoopIcon, title: 'Continuous improvement', body: 'CMS, faculty and analytics keep the ecosystem honest.' },
];

export function Values() {
  return (
    <section id="values">
      <PageContainer>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gc-blue">Our values</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="mt-2 font-display text-3xl text-gc-black">What we refuse to compromise</h2>
        </Reveal>
        <StaggerContainer className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((item, i) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.title}>
                <article className="gc-card gc-card-lift h-full p-5">
                  <CardIcon variant={CARD_ICON_CYCLE[i % CARD_ICON_CYCLE.length]}>
                    <Icon />
                  </CardIcon>
                  <h3 className="mt-3 font-display text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm text-gc-mute">{item.body}</p>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </PageContainer>
    </section>
  );
}
