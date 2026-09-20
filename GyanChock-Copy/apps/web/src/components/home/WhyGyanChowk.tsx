'use client';

import {
  Award,
  BookOpen,
  GraduationCap,
  LineChart,
  MessageCircle,
  PlayCircle,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/motion';
import { SectionHeading } from './SectionHeading';

const ITEMS = [
  {
    accent: 'blue',
    tone: 'navy',
    icon: BookOpen,
    title: 'Structured learning',
    body: 'Paths built around exams, subjects and skills — not a livestream calendar.',
  },
  {
    accent: 'violet',
    tone: 'violet',
    icon: GraduationCap,
    title: 'Expert faculty',
    body: 'Approved educators, listed with the subjects they actually teach.',
  },
  {
    accent: 'teal',
    tone: 'blue',
    icon: PlayCircle,
    title: 'Recorded lessons',
    body: 'Pause, rewind and revisit until the idea holds.',
  },
  {
    accent: 'amber',
    tone: 'warm',
    icon: Target,
    title: 'Practice & testing',
    body: 'Timed papers with ranks computed after you submit.',
  },
  {
    accent: 'purple',
    tone: 'cyan',
    icon: LineChart,
    title: 'Progress tracking',
    body: 'Completion lives on the server, not in a browser tab.',
  },
  {
    accent: 'cyan',
    tone: 'blue',
    icon: MessageCircle,
    title: 'Mentor support',
    body: 'Doubts become threads. Answers stay with the lesson.',
  },
  {
    accent: 'rose',
    tone: 'warm',
    icon: ShieldCheck,
    title: 'Verified courses',
    body: 'Access unlocks after payment is confirmed on the server.',
  },
  {
    accent: 'indigo',
    tone: 'navy',
    icon: Award,
    title: 'Certificates',
    body: 'Issued when completion rules for an eligible programme are met.',
  },
] as const;

export function WhyGyanChowk() {
  return (
    <section className="gc-why" aria-labelledby="why">
      <div className="gc-container gc-why-inner">
        <div className="gc-why-head">
          <SectionHeading
            id="why"
            kicker="Why Gyan Chowk"
            title="Serious tools. Quiet rooms."
            subtitle="The platform is built for deep work — recorded video, ranked tests, and mentors who reply in writing."
            align="center"
          />
        </div>
        <StaggerContainer className="gc-why-grid">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <StaggerItem key={item.title}>
                <article className="gc-why-card" data-accent={item.accent} data-tone={item.tone}>
                  <span className="gc-why-wash" aria-hidden="true" />
                  <span className="gc-why-orb" aria-hidden="true" />
                  <span className="gc-platform-icon" aria-hidden="true">
                    <Icon size={26} strokeWidth={1.7} absoluteStrokeWidth />
                  </span>
                  <h3 className="gc-why-title">{item.title}</h3>
                  <span className="gc-why-rule" aria-hidden="true" />
                  <p className="gc-why-body">{item.body}</p>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
