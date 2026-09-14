'use client';

import { BookOpen, ClipboardCheck, FileText, HelpCircle, LineChart, Medal, Target, Users } from 'lucide-react';
import { PageContainer, SectionHeader } from '@/components/layout/Page';
import { AnimatedSection, StaggerContainer, StaggerItem } from '@/components/motion';

const items = [
  { icon: Users, title: 'Expert teachers', body: 'Approved faculty publish recorded paths — emails and payouts stay private.' },
  { icon: Target, title: 'Structured curriculum', body: 'Subjects, chapters, topics and lessons follow the course attached to the batch.' },
  { icon: BookOpen, title: 'Recorded video learning', body: 'HLS playback with resume. Access unlocks only after verified enrollment.' },
  { icon: FileText, title: 'Study materials', body: 'Notes and files sit behind enrollment. Nothing is unlocked in the browser alone.' },
  { icon: ClipboardCheck, title: 'Tests and assessments', body: 'Ranks and scores are computed on the server after real attempts.' },
  { icon: HelpCircle, title: 'Doubt resolution', body: 'Async doubts with images. Teachers answer on the record — no live chat classroom.' },
  { icon: LineChart, title: 'Performance analytics', body: 'Progress, ranks and backlog come from stored attempts, not estimates.' },
  { icon: Medal, title: 'Progress tracking', body: 'Lesson completion and certificates are issued from server-side totals.' },
];

export function BatchBenefits() {
  return (
    <AnimatedSection>
      <PageContainer>
        <SectionHeader title="Everything you need in one structured learning journey" />
        <StaggerContainer className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((f) => {
            const Icon = f.icon;
            return (
              <StaggerItem key={f.title}>
                <article className="gc-card group h-full p-5 transition-transform duration-300 hover:-translate-y-1">
                  <Icon className="text-gc-gold transition-transform duration-300 group-hover:scale-105 group-hover:rotate-6" size={20} />
                  <h3 className="mt-3 font-display text-lg text-gc-gold">{f.title}</h3>
                  <p className="mt-2 text-sm text-gc-mist">{f.body}</p>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </PageContainer>
    </AnimatedSection>
  );
}
