'use client';

import Link from 'next/link';
import type { FormEvent, ReactNode } from 'react';
import { PageContainer, SectionHeader } from '@/components/layout/Page';
import { CourseGrid } from './CourseCard';
import { BatchGrid } from './BatchCard';
import { TeacherCard } from './TeacherCard';
import type { CourseCardData, BatchCardData, TeacherCardData } from '@/lib/types';
import { HeroVisual } from '@/components/3d/HeroVisual';
import { SkeletonCard } from '@/components/ui/States';

export function HeroSection({
  kicker,
  title,
  body,
  cta,
  secondary,
  onSearch,
}: {
  kicker: string;
  title: string;
  body: string;
  cta: string;
  secondary: string;
  onSearch: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className="relative">
      <PageContainer className="py-14 sm:py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="gc-kicker mb-5">{kicker}</p>
          <h1 className="font-display text-[2.6rem] font-normal leading-[1.08] tracking-tight text-gc-black sm:text-6xl md:text-[4.75rem]">
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-gc-mist">{body}</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="gc-btn-primary w-full sm:w-auto">
              {cta}
            </Link>
            <Link href="/courses" className="gc-btn-outline w-full sm:w-auto">
              {secondary}
            </Link>
          </div>
          <form onSubmit={onSearch} className="mx-auto mt-8 flex w-full max-w-md flex-col gap-2 sm:flex-row">
            <input
              name="q"
              className="gc-input"
              placeholder="Ask for a course, exam or teacher…"
              aria-label="Search courses"
              suppressHydrationWarning
            />
            <button className="gc-btn-outline w-full shrink-0 sm:w-auto" type="submit" suppressHydrationWarning>
              Search
            </button>
          </form>
        </div>
        <div className="mx-auto mt-14 max-w-3xl">
          <HeroVisual />
        </div>
      </PageContainer>
    </section>
  );
}

export function CategoryGrid({ categories }: { categories: string[] }) {
  return (
    <PageContainer className="pt-0">
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((c) => (
          <Link key={c} href={`/courses?category=${encodeURIComponent(c)}`} className="gc-chip">
            {c}
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}

export function FeaturedCourseSection({ courses, loading }: { courses: CourseCardData[]; loading?: boolean }) {
  if (loading || !courses.length) return null;
  return (
    <PageContainer>
      <SectionHeader title="Featured courses" href="/courses" />
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <CourseGrid courses={courses} featured />
      )}
    </PageContainer>
  );
}

export function FeaturedBatchSection({ batches }: { batches: BatchCardData[] }) {
  if (!batches.length) return null;
  return (
    <PageContainer>
      <SectionHeader title="Batches" href="/batches" />
      <BatchGrid batches={batches} />
    </PageContainer>
  );
}

export function TeacherCarousel({ teachers }: { teachers: TeacherCardData[] }) {
  if (!teachers.length) return null;
  return (
    <PageContainer>
      <SectionHeader title="Faculty" href="/teachers" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {teachers.slice(0, 3).map((t) => (
          <TeacherCard key={t._id} teacher={t} />
        ))}
      </div>
    </PageContainer>
  );
}

export function FeatureGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-3xl text-gc-black sm:text-4xl">Built for deep work</h2>
        <p className="mt-3 text-gc-mute">Everything you need to learn, practice and get unstuck — without a live-class tab open.</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-5xl gap-10 sm:grid-cols-3">
        {items.slice(0, 3).map(([title, body]) => (
          <article key={title}>
            <h3 className="font-display text-2xl text-gc-black">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gc-mist">{body}</p>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}

export function HowItWorks({ steps }: { steps: string[] }) {
  return (
    <PageContainer>
      <h2 className="text-center font-display text-3xl text-gc-black sm:text-4xl">How it works</h2>
      <ol className="mx-auto mt-10 max-w-2xl space-y-6">
        {steps.map((step, i) => (
          <li key={step} className="flex gap-4 text-left">
            <span className="font-display text-2xl text-gc-mute">{String(i + 1).padStart(2, '0')}</span>
            <p className="pt-1 text-lg text-gc-black">{step}</p>
          </li>
        ))}
      </ol>
    </PageContainer>
  );
}

export function StatsSection({ items }: { items: Array<[string, string]> }) {
  if (!items.length) return null;
  return null;
}

export function FAQSection({ faqs }: { faqs: Array<{ _id: string; question: string; answer: string }> }) {
  if (!faqs.length) return null;
  return (
    <PageContainer>
      <h2 className="font-display text-3xl text-gc-black">Questions</h2>
      <div className="mt-8 divide-y divide-gc-line border-y border-gc-line">
        {faqs.slice(0, 5).map((f) => (
          <details key={f._id} className="py-4">
            <summary className="cursor-pointer text-gc-black">{f.question}</summary>
            <p className="mt-2 text-sm leading-relaxed text-gc-mist">{f.answer}</p>
          </details>
        ))}
      </div>
    </PageContainer>
  );
}

export function CTASection({ children }: { children?: ReactNode }) {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-4xl rounded-[32px] bg-gyan-cta px-6 py-14 text-center text-white sm:px-12">
        <h2 className="font-display text-3xl font-normal sm:text-5xl">Start with a free student account</h2>
        <p className="mx-auto mt-4 max-w-lg text-white/70">
          Browse the catalogue. Enroll only after payment is verified on the server.
        </p>
        {children ?? (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register" className="gc-btn w-full bg-white text-gc-black hover:bg-gc-line sm:w-auto">
              Get started
            </Link>
            <Link href="/contact" className="gc-btn-ghost-inverse w-full sm:w-auto">
              Talk to us
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
