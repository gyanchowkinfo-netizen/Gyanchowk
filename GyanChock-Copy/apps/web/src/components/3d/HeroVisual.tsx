'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { FloatingElement, ImageReveal, useMotionPrefs } from '@/components/motion';

const TeachersCanvas = dynamic(
  () =>
    import('./Scenes').then((m) => {
      function Inner() {
        const { TeachersScene, ThreeCanvasWrapper } = m;
        return (
          <ThreeCanvasWrapper className="absolute inset-0">
            <TeachersScene />
          </ThreeCanvasWrapper>
        );
      }
      return Inner;
    }),
  { ssr: false },
);
const CareerCanvas = dynamic(
  () =>
    import('./Scenes').then((m) => {
      function Inner() {
        const { CareerScene, ThreeCanvasWrapper } = m;
        return (
          <ThreeCanvasWrapper className="absolute inset-0">
            <CareerScene />
          </ThreeCanvasWrapper>
        );
      }
      return Inner;
    }),
  { ssr: false },
);

const BatchesCanvas = dynamic(
  () =>
    import('./Scenes').then((m) => {
      function Inner() {
        const { BatchesScene, ThreeCanvasWrapper } = m;
        return (
          <ThreeCanvasWrapper className="absolute inset-0">
            <BatchesScene />
          </ThreeCanvasWrapper>
        );
      }
      return Inner;
    }),
  { ssr: false },
);

const BlogCanvas = dynamic(
  () =>
    import('./Scenes').then((m) => {
      function Inner() {
        const { BlogScene, ThreeCanvasWrapper } = m;
        return (
          <ThreeCanvasWrapper className="absolute inset-0">
            <BlogScene />
          </ThreeCanvasWrapper>
        );
      }
      return Inner;
    }),
  { ssr: false },
);

const AboutCanvas = dynamic(
  () =>
    import('./Scenes').then((m) => {
      function Inner() {
        const { AboutScene, ThreeCanvasWrapper } = m;
        return (
          <ThreeCanvasWrapper className="absolute inset-0">
            <AboutScene />
          </ThreeCanvasWrapper>
        );
      }
      return Inner;
    }),
  { ssr: false },
);

function FallbackOrbit({ labels }: { labels?: [string, string, string] }) {
  const [a, b, c] = labels ?? ['Recorded video', 'Ranks', 'Certificate'];
  return (
    <div className="relative grid h-full place-items-center">
      <FloatingElement duration={4} className="absolute left-6 top-8 gc-card px-3 py-2 text-xs">
        {a}
      </FloatingElement>
      <FloatingElement duration={5} className="absolute right-8 top-16 gc-card px-3 py-2 text-xs">
        {b}
      </FloatingElement>
      <FloatingElement duration={6} className="absolute bottom-10 left-10 gc-card px-3 py-2 text-xs">
        {c}
      </FloatingElement>
      <BrandLogo size={200} />
    </div>
  );
}

function SceneFrame({
  allow3d,
  canvas,
  fallback,
  logo,
}: {
  allow3d: boolean;
  canvas: ReactNode;
  fallback: ReactNode;
  logo?: boolean;
}) {
  return (
    <ImageReveal className="relative aspect-square max-h-[320px] w-full max-w-[460px] sm:max-h-[460px]">
      <div className="relative h-full overflow-hidden rounded-3xl border border-gc-line bg-gc-ink/70 shadow-glow">
        {allow3d ? canvas : fallback}
        {allow3d && logo ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <BrandLogo size={150} />
          </div>
        ) : null}
      </div>
    </ImageReveal>
  );
}

export function HeroVisual() {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-gc-line bg-[color:var(--gyan-surface)] p-5 sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-gc-mute">Gyan Chowk</p>
        <span className="h-2 w-2 rounded-full bg-gc-black/40" />
      </div>
      <div className="space-y-5 text-left">
        <div>
          <p className="text-xs text-gc-mute">You</p>
          <p className="mt-1 text-[15px] text-gc-black">Walk me through projectile motion, then give me a 10-question test.</p>
        </div>
        <div className="rounded-2xl bg-[color:var(--gyan-background)] p-4">
          <p className="text-xs text-gc-mute">Lesson</p>
          <p className="mt-1 text-[15px] leading-relaxed text-gc-black">
            A projectile follows a parabola under gravity. Watch the recorded chapter, then sit a ranked paper — answers stay on the server.
          </p>
        </div>
      </div>
      <p className="mt-6 border-t border-gc-line pt-4 text-sm text-gc-mute">Ask a doubt · Continue a lesson · Start a test</p>
    </div>
  );
}

export function CareerHeroVisual() {
  const { allow3d } = useMotionPrefs();
  return (
    <SceneFrame
      allow3d={allow3d}
      canvas={<CareerCanvas />}
      fallback={<FallbackOrbit labels={['Skills', 'Projects', 'Career']} />}
    />
  );
}

export function TeachersHeroVisual() {
  const { allow3d } = useMotionPrefs();
  return (
    <ImageReveal className="relative aspect-square max-h-[320px] w-full max-w-[460px] sm:max-h-[460px]">
      <div className="relative h-full overflow-hidden rounded-3xl border border-gc-line bg-gc-ink/70 shadow-glow">
        {allow3d ? <TeachersCanvas /> : <FallbackOrbit />}
        {allow3d ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <BrandLogo size={150} />
          </div>
        ) : null}
      </div>
    </ImageReveal>
  );
}

export function BatchesHeroVisual() {
  const { allow3d } = useMotionPrefs();
  return (
    <SceneFrame
      allow3d={allow3d}
      canvas={<BatchesCanvas />}
      fallback={<FallbackOrbit />}
      logo
    />
  );
}

export function BlogHeroVisual() {
  const { allow3d } = useMotionPrefs();
  return (
    <SceneFrame
      allow3d={allow3d}
      canvas={<BlogCanvas />}
      fallback={<FallbackOrbit labels={['Guides', 'Ideas', 'Learning']} />}
    />
  );
}

export function AboutHeroVisual() {
  const { allow3d } = useMotionPrefs();
  return (
    <SceneFrame
      allow3d={allow3d}
      canvas={<AboutCanvas />}
      fallback={<FallbackOrbit labels={['Courses', 'Tests', 'Certificates']} />}
      logo
    />
  );
}
