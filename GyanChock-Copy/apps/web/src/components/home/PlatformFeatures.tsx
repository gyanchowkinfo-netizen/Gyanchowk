'use client';

import type { LucideIcon } from 'lucide-react';
import {
  Award,
  Bookmark,
  BookOpen,
  Clock3,
  LayoutDashboard,
  Library,
  LineChart,
  Map,
  MessageCircle,
  NotebookPen,
  PlayCircle,
  ShieldCheck,
  Target,
  Trophy,
  UsersRound,
} from 'lucide-react';
import { StaggerContainer, StaggerItem } from '@/components/motion';
import type { DiscoveryTone, HomePlatformFeature, HomeSectionCopy } from '@/lib/types';
import { SectionHeading } from './SectionHeading';
import { PLATFORM_FEATURES } from './content';

const ICONS: Record<string, LucideIcon> = {
  play: PlayCircle,
  trophy: Trophy,
  message: MessageCircle,
  chart: LineChart,
  award: Award,
  layout: LayoutDashboard,
  bookmark: Bookmark,
  library: Library,
  path: Map,
  target: Target,
  clock: Clock3,
  shield: ShieldCheck,
  notes: NotebookPen,
  users: UsersRound,
  book: BookOpen,
};

const TONES: DiscoveryTone[] = ['navy', 'blue', 'violet', 'cyan', 'warm'];

function fallbackFeatures(): HomePlatformFeature[] {
  return PLATFORM_FEATURES.map((f, index) => ({
    title: f.title,
    body: f.body,
    icon: f.icon,
    tone: TONES[index % TONES.length],
  }));
}

export function FeatureGrid({
  features,
  copy,
}: {
  features?: HomePlatformFeature[];
  copy?: HomeSectionCopy;
}) {
  const items = features?.length ? features : fallbackFeatures();

  return (
    <section className="relative overflow-hidden border-y border-gc-line/70 bg-[color:var(--surface-soft)]" aria-labelledby="features">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-[color:var(--brand-blue)]/[0.06] blur-3xl" />
        <div className="absolute -right-10 bottom-6 h-48 w-48 rounded-full bg-[color:var(--brand-violet)]/[0.07] blur-3xl" />
      </div>
      <div className="gc-container relative py-14 md:py-20">
        <SectionHeading
          id="features"
          kicker={copy?.kicker || 'Platform'}
          title={copy?.title || 'Built for deep work'}
          subtitle={
            copy
              ? copy.subtitle
              : 'Recorded video, tests & ranks, doubts & mentors — plus the workspace that holds them together.'
          }
          align="center"
        />
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {items.map((f, index) => {
            const Icon = ICONS[f.icon] ?? PlayCircle;
            const tone = f.tone ?? TONES[index % TONES.length];
            return (
              <StaggerItem key={`${f.title}-${index}`}>
                <article
                  data-tone={tone}
                  className="gc-card gc-card-lift gc-platform-card group flex h-full min-h-[15.5rem] flex-col items-center px-5 py-6 text-center sm:min-h-[16.25rem] sm:px-6"
                >
                  <span className="gc-platform-icon">
                    <Icon size={26} strokeWidth={1.7} absoluteStrokeWidth aria-hidden />
                  </span>
                  <h3 className="mt-5 text-base font-bold tracking-tight text-gc-black sm:text-lg">{f.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gc-mute">{f.body}</p>
                </article>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
