'use client';

import { EmptyState } from '@/components/ui/States';
import type { HomePlatformFeature, HomeSectionCopy } from '@/lib/types';
import { PLATFORM_FEATURES } from './content';
import { HomeCardCarousel, HomeCardSectionHeading } from './HomeCardCarousel';
import { HomePhotoCard } from './HomePhotoCard';

const FALLBACK_IMAGES: Record<string, string> = {
  'Recorded Courses': '/overlays/overlay-recorded.png',
  'Ranked Tests': '/overlays/overlay-notes.png',
  'Doubt Support': '/mentorship-workspace.png',
  'Progress Tracking': '/overlays/overlay-progress.png',
  Certificates: '/overlays/overlay-certificate.png',
  'Learning Dashboard': '/practice-workspace.png',
  'Bookmarks & Notes': '/overlays/overlay-notes.png',
  'Practice Library': '/overlays/overlay-library.png',
  'Structured Paths': '/overlays/overlay-skills.png',
  'Exam Analytics': '/overlays/overlay-progress.png',
};

function fallbackFeatures(): HomePlatformFeature[] {
  return PLATFORM_FEATURES.map((f) => ({
    title: f.title,
    body: f.body,
    icon: f.icon,
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
    <section className="relative overflow-hidden" aria-labelledby="features">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-16 top-10 h-56 w-56 rounded-full bg-[color:var(--brand-blue)]/[0.06] blur-3xl" />
        <div className="absolute -right-10 bottom-6 h-48 w-48 rounded-full bg-[color:var(--brand-violet)]/[0.07] blur-3xl" />
      </div>
      <div className="gc-container relative py-7 md:py-10">
        <HomeCardSectionHeading
          id="features"
          kicker={copy?.kicker || 'Platform'}
          title={copy?.title || 'Built for deep work'}
          subtitle={
            copy?.subtitle ||
            'Personalized video, tests & ranking, doubt support — plus the workspace that holds them together.'
          }
        />
        {items.length ? (
          <HomeCardCarousel
            count={items.length}
            ariaLabel="Platform features"
            renderSlide={(index, eager) => {
              const f = items[index];
              return (
                <HomePhotoCard
                  index={index}
                  eager={eager}
                  card={{
                    title: f.title,
                    body: f.body,
                    imageUrl: f.imageUrl || FALLBACK_IMAGES[f.title],
                    href: f.href,
                    ctaText: f.ctaText || (f.href ? 'Explore →' : undefined),
                    accent: f.accent,
                  }}
                />
              );
            }}
          />
        ) : (
          <EmptyState title="No content available yet." body="Platform cards will appear here once they are published." />
        )}
      </div>
    </section>
  );
}
