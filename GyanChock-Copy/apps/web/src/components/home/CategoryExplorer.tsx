'use client';

import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Code2,
  FlaskConical,
  GraduationCap,
  Landmark,
  Microscope,
  Sigma,
} from 'lucide-react';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion';
import { SectionHeading } from './SectionHeading';
import { EXAM_LINKS } from './content';
import type { HomeDiscoveryPath, HomeSectionCopy } from '@/lib/types';

const ICON_BY_KEY: Record<string, LucideIcon> = {
  graduation: GraduationCap,
  microscope: Microscope,
  book: BookOpen,
  landmark: Landmark,
  code: Code2,
  briefcase: Briefcase,
  flask: FlaskConical,
  sigma: Sigma,
};

const ICON_BY_NAME: Record<string, LucideIcon> = {
  JEE: GraduationCap,
  NEET: Microscope,
  Boards: BookOpen,
  'Government Exams': Landmark,
  Programming: Code2,
  Career: Briefcase,
  University: FlaskConical,
  'Skill Development': Briefcase,
  Mathematics: Sigma,
  Physics: FlaskConical,
};

function iconFor(item: HomeDiscoveryPath) {
  if (item.icon && ICON_BY_KEY[item.icon]) return ICON_BY_KEY[item.icon];
  return ICON_BY_NAME[item.name] ?? BookOpen;
}

export function CategoryExplorer({
  counts,
  paths,
  copy,
}: {
  counts?: Record<string, number>;
  paths?: HomeDiscoveryPath[];
  copy?: HomeSectionCopy;
}) {
  const items: HomeDiscoveryPath[] = paths?.length
    ? paths
    : EXAM_LINKS.map((c) => ({ name: c.name, href: c.href, body: c.body, tone: c.tone }));

  return (
    <section className="gc-container py-14 md:py-20" aria-labelledby="paths">
      <SectionHeading
        id="paths"
        kicker={copy?.kicker || 'Discovery'}
        title={copy?.title || 'Choose your path'}
        subtitle={copy ? copy.subtitle : 'Focused learning for exams, academics, careers, and technology.'}
        align="center"
      />
      <StaggerContainer className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {items.map((c) => {
          const Icon = iconFor(c);
          return (
            <StaggerItem key={`${c.name}-${c.href}`}>
              <Link
                href={c.href}
                data-tone={c.tone}
                className="gc-card gc-card-lift gc-discover-card group flex h-full min-h-[11.5rem] flex-col p-4 sm:min-h-[12.5rem] sm:p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="gc-discover-icon">
                    <Icon size={22} strokeWidth={2.25} aria-hidden />
                  </span>
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-gc-line/80 bg-white/70 text-gc-mute shadow-sm transition duration-200 group-hover:border-[color:var(--brand-blue)]/25 group-hover:text-gc-black">
                    <ArrowUpRight size={16} aria-hidden />
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold tracking-tight text-gc-black sm:text-lg">{c.name}</h3>
                <p className="mt-1.5 line-clamp-2 flex-1 text-xs leading-relaxed text-gc-mute sm:text-sm">{c.body}</p>
                {counts?.[c.name] ? (
                  <p className="mt-3 text-xs font-medium text-[color:var(--brand-navy)]">{counts[c.name]} courses</p>
                ) : (
                  <p className="mt-3 text-xs font-medium text-gc-mist">Explore →</p>
                )}
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
      <Reveal>
        <p className="mt-6 text-center">
          <Link href="/courses" className="text-sm text-gc-mute hover:text-gc-black">
            Browse the full catalogue →
          </Link>
        </p>
      </Reveal>
    </section>
  );
}
