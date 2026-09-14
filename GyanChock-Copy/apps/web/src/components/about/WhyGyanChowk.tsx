'use client';

import {
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  HelpCircle,
  Medal,
  PlayCircle,
  Trophy,
  UserCheck,
  Users,
  Video,
  Award,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { Reveal, StaggerContainer, StaggerItem, TiltCard } from '@/components/motion';

const reasons = [
  { icon: Video, title: 'Recorded video learning', body: 'HLS lessons you can pause, resume and revisit.' },
  { icon: Users, title: 'Structured batches', body: 'Cohorts with a syllabus, schedule and faculty.' },
  { icon: FileText, title: 'Study materials', body: 'Notes and PDFs unlocked after verified enrollment.' },
  { icon: ClipboardList, title: 'Tests', body: 'Timed papers, negative marking and ranks.' },
  { icon: BookOpen, title: 'Assignments', body: 'Published work evaluated on the server.' },
  { icon: HelpCircle, title: 'Doubt resolution', body: 'Async doubt engine with teacher replies.' },
  { icon: UserCheck, title: 'Mentorship', body: 'Guided reviews with faculty on a recorded learning cadence.' },
  { icon: Medal, title: 'Attendance', body: 'Batch attendance tracked from real sessions.' },
  { icon: BarChart3, title: 'Analytics', body: 'Progress from actual watch and attempt data.' },
  { icon: Trophy, title: 'Rankings', body: 'Leaderboards from submitted tests, not estimates.' },
  { icon: Award, title: 'Certificates', body: 'Issued from completion rules you can verify.' },
  { icon: PlayCircle, title: 'Career resources', body: 'Roadmaps and articles from the career desk.' },
];

export function WhyGyanChowk() {
  return (
    <section id="why">
      <PageContainer>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Why Gyan Chowk</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="mt-2 font-display text-3xl text-gc-black md:text-4xl">A complete recorded learning stack</h2>
        </Reveal>
        <StaggerContainer className="mt-8 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.title} className="h-full">
                <TiltCard intensity={4} className="h-full">
                  <article className="gc-card flex h-full flex-col p-5">
                    <Icon className="text-gc-gold" size={20} aria-hidden />
                    <h3 className="mt-3 font-display text-lg">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-gc-mute">{item.body}</p>
                  </article>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </PageContainer>
    </section>
  );
}
