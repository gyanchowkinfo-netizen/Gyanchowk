'use client';

import Link from 'next/link';
import { Reveal } from '@/components/motion';
import { EmptyState } from '@/components/ui/States';
import type { HomeDiscoveryPath, HomeSectionCopy } from '@/lib/types';
import { EXAM_LINKS } from './content';
import { HomeCardCarousel, HomeCardSectionHeading } from './HomeCardCarousel';
import { HomePhotoCard } from './HomePhotoCard';

const FALLBACK_IMAGES: Record<string, string> = {
  JEE: '/overlays/overlay-jee.png',
  NEET: '/overlays/overlay-neet.png',
  Boards: '/overlays/overlay-boards.png',
  'Government Exams': '/overlays/overlay-government.png',
  Programming: '/overlays/overlay-programming.png',
  Career: '/overlays/overlay-career.png',
  University: '/overlays/overlay-university.png',
  'Skill Development': '/overlays/overlay-skills.png',
  Mathematics: '/overlays/overlay-mathematics.png',
  Physics: '/overlays/overlay-physics.png',
};

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
    <section className="gc-container overflow-x-hidden py-7 md:py-10" aria-labelledby="paths">
      <HomeCardSectionHeading
        id="paths"
        kicker={copy?.kicker || 'Discovery'}
        title={copy?.title || 'Choose your path'}
        subtitle={copy ? copy.subtitle : 'Focused learning for exams, academics, careers, and technology.'}
        highlight="your path"
      />
      {items.length ? (
        <HomeCardCarousel
          count={items.length}
          ariaLabel="Discovery paths"
          renderSlide={(index, eager) => {
            const c = items[index];
            const countLabel = counts?.[c.name] ? `${counts[c.name]} courses →` : undefined;
            return (
              <HomePhotoCard
                index={index}
                eager={eager}
                card={{
                  title: c.name,
                  body: c.body,
                  imageUrl: c.imageUrl || FALLBACK_IMAGES[c.name],
                  href: c.href,
                  ctaText: c.ctaText || countLabel || 'Explore →',
                  accent: c.accent,
                }}
              />
            );
          }}
        />
      ) : (
        <EmptyState title="No content available yet." body="Discovery cards will appear here once they are published." />
      )}
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
