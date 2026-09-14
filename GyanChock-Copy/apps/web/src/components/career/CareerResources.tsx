'use client';

import Link from 'next/link';
import { BookMarked, FileText, GraduationCap, Landmark, Map, Newspaper, ScrollText, Trophy } from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { Reveal, StaggerContainer, StaggerItem, TiltCard } from '@/components/motion';

const resources = [
  { icon: Map, title: 'Roadmaps', body: 'Step-by-step recorded learning maps.', href: '/career/roadmaps' },
  { icon: FileText, title: 'Interview preparation', body: 'Career articles on interviews and readiness.', href: '/career#articles' },
  { icon: ScrollText, title: 'Resume resources', body: 'Guides from the career desk when published.', href: '/career#articles' },
  { icon: Newspaper, title: 'Career guides', body: 'Practical articles on skills and opportunity.', href: '/career#articles' },
  { icon: Landmark, title: 'Scholarships', body: 'Scholarship notes appear when the CMS publishes them.', href: '/career#articles' },
  { icon: Trophy, title: 'Competitive exams', body: 'Batches and courses for exam-focused recorded prep.', href: '/batches' },
  { icon: BookMarked, title: 'Programming resources', body: 'Recorded courses for applied programming.', href: '/courses' },
  { icon: GraduationCap, title: 'Career articles', body: 'The full published career library.', href: '/career#articles' },
];

export function CareerResources() {
  return (
    <section id="resources">
      <PageContainer>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Resources</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="mt-2 font-display text-3xl text-gc-black">Tools that actually go somewhere</h2>
        </Reveal>
        <StaggerContainer className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {resources.map((item) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.title}>
                <TiltCard intensity={4}>
                  <Link href={item.href} className="gc-card flex h-full flex-col p-5 hover:border-gc-gold">
                    <Icon className="text-gc-gold" size={20} aria-hidden />
                    <h3 className="mt-3 font-display text-lg">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-gc-mute">{item.body}</p>
                    <span className="mt-4 text-sm text-gc-glow">Open →</span>
                  </Link>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </PageContainer>
    </section>
  );
}
