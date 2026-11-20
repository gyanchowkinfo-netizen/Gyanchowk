'use client';

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
    <section className="w-full mx-0 px-0 overflow-x-hidden py-7 md:py-10" aria-labelledby="paths">
      <div className="gc-container">
        <HomeCardSectionHeading
          id="paths"
          kicker={copy?.kicker || 'Discovery'}
          title={copy?.title || 'Choose your path'}
          subtitle={copy ? copy.subtitle : 'Focused learning for exams, academics, careers, and technology.'}
          highlight="your path"
        />
      </div>
      {items.length ? (
        <div className="w-full mx-0 px-0 mt-2 sm:mt-4">
          <HomeCardCarousel
            count={items.length}
            ariaLabel="Discovery paths"
            renderSlide={(index, eager) => {
              const c = items[index];
              return (
                <HomePhotoCard
                  index={index}
                  eager={eager}
                  card={{
                    title: c.name,
                    body: c.body,
                    imageUrl: c.imageUrl || FALLBACK_IMAGES[c.name],
                    href: c.href,
                    accent: c.accent,
                  }}
                />
              );
            }}
          />
        </div>
      ) : (
        <div className="gc-container">
          <EmptyState title="No content available yet." body="Discovery cards will appear here once they are published." />
        </div>
      )}
    </section>
  );
}
