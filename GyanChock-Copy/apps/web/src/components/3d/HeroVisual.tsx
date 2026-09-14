'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { FloatingElement, ImageReveal, useMotionPrefs } from '@/components/motion';
const EducationCanvas = dynamic(
  () =>
    import('./Scenes').then((m) => {
      function Inner() {
        const { EducationScene, ThreeCanvasWrapper } = m;
        return (
          <ThreeCanvasWrapper className="absolute inset-0">
            <EducationScene />
          </ThreeCanvasWrapper>
        );
      }
      return Inner;
    }),
  { ssr: false },
);

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
    <ImageReveal className="relative aspect-square max-h-[460px] w-full max-w-[460px]">
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
  const { allow3d } = useMotionPrefs();
  return (
    <ImageReveal className="relative aspect-square max-h-[440px] w-full max-w-[440px]">
      <div className="relative h-full overflow-hidden rounded-3xl border border-gc-line bg-gc-ink/70 shadow-glow">
        {allow3d ? <EducationCanvas /> : <FallbackOrbit />}
        {allow3d ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <BrandLogo size={168} />
          </div>
        ) : null}
      </div>
    </ImageReveal>
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
    <ImageReveal className="relative aspect-square max-h-[460px] w-full max-w-[460px]">
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
