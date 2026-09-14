'use client';

import Link from 'next/link';
import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  HelpCircle,
  LineChart,
  PlayCircle,
  Trophy,
  UserCheck,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/Page';
import { Reveal, StaggerContainer, StaggerItem, TiltCard } from '@/components/motion';

const features = [
  { icon: BookOpen, title: 'Courses', href: '/courses', body: 'Recorded syllabi with verified enrollment.' },
  { icon: GraduationCap, title: 'Batches', href: '/batches', body: 'Structured programmes with faculty and tests.' },
  { icon: PlayCircle, title: 'Recorded learning', href: '/courses', body: 'HLS video with resume playback.' },
  { icon: ClipboardList, title: 'Tests', href: '/batches', body: 'Timed papers and ranks from real attempts.' },
  { icon: FileText, title: 'Assignments', href: '/batches', body: 'Published work, server-side evaluation.' },
  { icon: BookOpen, title: 'Study materials', href: '/courses', body: 'Notes unlocked after payment verification.' },
  { icon: HelpCircle, title: 'Doubt engine', href: '/about#why', body: 'Async questions with teacher replies.' },
  { icon: UserCheck, title: 'Mentorship', href: '/teachers', body: 'Faculty guidance through the mentorship workspace.' },
  { icon: BarChart3, title: 'Analytics', href: '/about#why', body: 'Progress from actual learning activity.' },
  { icon: Trophy, title: 'Rankings', href: '/about#why', body: 'Leaderboards from submitted tests.' },
  { icon: Award, title: 'Certificates', href: '/about#why', body: 'Issued from completion rules you can verify.' },
  { icon: LineChart, title: 'Career', href: '/career', body: 'Roadmaps and articles for the next step.' },
];

export function PlatformFeatures() {
  return (
    <section id="platform">
      <PageContainer>
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gc-gold">Platform</p>
        </Reveal>
        <Reveal delay={0.04}>
          <h2 className="mt-2 font-display text-3xl text-gc-black md:text-4xl">Everything students need to learn better</h2>
        </Reveal>
        <StaggerContainer className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => {
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
