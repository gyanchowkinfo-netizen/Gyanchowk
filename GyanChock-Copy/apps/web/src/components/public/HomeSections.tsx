'use client';

import Link from 'next/link';
import type { FormEvent, ReactNode } from 'react';
import { PageContainer, SectionHeader } from '@/components/layout/Page';
import { CourseGrid } from './CourseCard';
import { BatchGrid } from './BatchCard';
import { TeacherCard } from './TeacherCard';
import type { CourseCardData, BatchCardData, TeacherCardData } from '@/lib/types';
import {
  AnimatedSection,
  MagneticButton,
  Parallax,
  Reveal,
  SoftBg,
  StaggerContainer,
  StaggerItem,
  TextReveal,
} from '@/components/motion';
import { HeroVisual } from '@/components/3d/HeroVisual';

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
    <section className="relative overflow-hidden bg-gc-hero">
      <SoftBg />
      <PageContainer>
        <div className="relative grid items-center gap-10 md:grid-cols-2">
          <Parallax speed={0.08}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-gc-gold">{kicker}</p>
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
              <TextReveal text={title} />
            </h1>
            <p className="mt-5 max-w-xl text-gc-mist">{body}</p>
            <CourseSearch onSearch={onSearch} />
            <div className="mt-6 flex flex-wrap gap-3">
              <MagneticButton href="/courses">{cta}</MagneticButton>
              <Link href="/batches" className="gc-btn-blue">
                {secondary}
              </Link>
            </div>
          </Parallax>
          <Parallax speed={0.18} className="flex justify-center">
            <HeroVisual />
          </Parallax>
        </div>
      </PageContainer>
    </section>
  );
}

export function CourseSearch({ onSearch }: { onSearch: (e: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSearch} className="mt-8 flex max-w-xl gap-2">
      <input name="q" className="gc-input" placeholder="Search JEE Physics, batches, teachers…" aria-label="Search courses" />
      <button className="gc-btn-gold shrink-0" type="submit">
        Search
      </button>
    </form>
  );
}

export function CategoryGrid({ categories }: { categories: string[] }) {
  return (
    <AnimatedSection>
      <PageContainer>
        <SectionHeader title="Popular categories" href="/courses" />
        <StaggerContainer className="grid grid-cols-2 gap-3 md:grid-cols-6">
          {categories.map((c) => (
            <StaggerItem key={c}>
              <Link href={`/courses?category=${encodeURIComponent(c)}`} className="gc-card block px-4 py-5 text-center text-sm hover:border-gc-gold">
                {c}
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageContainer>
    </AnimatedSection>
  );
}

export function FeaturedCourseSection({ courses, loading }: { courses: CourseCardData[]; loading?: boolean }) {
  return (
    <AnimatedSection>
      <PageContainer>
        <SectionHeader title="Featured courses" href="/courses" />
        {loading ? <p className="text-sm text-gc-mute">Loading courses…</p> : <CourseGrid courses={courses} featured />}
      </PageContainer>
    </AnimatedSection>
  );
}

export function FeaturedBatchSection({ batches }: { batches: BatchCardData[] }) {
  return (
    <AnimatedSection>
      <PageContainer>
        <SectionHeader title="Featured batches" href="/batches" />
        <BatchGrid batches={batches} />
      </PageContainer>
    </AnimatedSection>
  );
}

export function TeacherCarousel({ teachers }: { teachers: TeacherCardData[] }) {
  return (
    <AnimatedSection>
      <PageContainer>
        <SectionHeader title="Popular teachers" href="/teachers" />
        <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teachers.slice(0, 6).map((t) => (
            <StaggerItem key={t._id}>
              <TeacherCard teacher={t} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageContainer>
    </AnimatedSection>
  );
}

export function FeatureGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <AnimatedSection>
      <PageContainer>
        <SectionHeader title="Why Gyan Chowk" />
        <StaggerContainer className="grid items-stretch gap-5 md:grid-cols-3">
          {items.map(([title, body]) => (
            <StaggerItem key={title} className="h-full">
              <article className="gc-card flex h-full flex-col p-6">
                <div className="mb-3 h-2 w-10 bg-gradient-to-r from-gc-blue to-gc-gold" />
                <h3 className="font-display text-xl text-gc-black">{title}</h3>
                <p className="mt-2 flex-1 text-sm text-gc-mist">{body}</p>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageContainer>
    </AnimatedSection>
  );
}

export function HowItWorks({ steps }: { steps: string[] }) {
  return (
    <AnimatedSection>
      <PageContainer>
        <SectionHeader title="How it works" />
        <StaggerContainer className="grid items-stretch gap-5 md:grid-cols-4">
          {steps.map((step, i) => (
            <StaggerItem key={step} className="h-full">
              <li className="gc-card flex h-full flex-col list-none p-5">
                <p className="text-gc-gold">{String(i + 1).padStart(2, '0')}</p>
                <p className="mt-2 font-display">{step}</p>
              </li>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageContainer>
    </AnimatedSection>
  );
}

export function StatsSection({ items }: { items: Array<[string, string]> }) {
  return (
    <AnimatedSection>
      <PageContainer>
        <StaggerContainer className="grid gap-4 sm:grid-cols-4">
          {items.map(([k, v]) => (
            <StaggerItem key={k}>
              <div className="gc-card p-5 text-center">
                <p className="font-display text-2xl text-gc-black">{k}</p>
                <p className="mt-2 text-sm text-gc-mute">{v}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageContainer>
    </AnimatedSection>
  );
}

export function TestimonialSection({ quotes }: { quotes: string[] }) {
  return (
    <AnimatedSection>
      <PageContainer>
        <SectionHeader title="What students say" />
        <StaggerContainer className="grid gap-4 md:grid-cols-3">
          {quotes.map((quote) => (
            <StaggerItem key={quote}>
              <blockquote className="gc-card p-5 text-sm text-gc-mist">“{quote}”</blockquote>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </PageContainer>
    </AnimatedSection>
  );
}

export function FAQSection({ faqs }: { faqs: Array<{ _id: string; question: string; answer: string }> }) {
  return (
    <AnimatedSection>
      <PageContainer>
        <SectionHeader title="FAQs" href="/faq" />
        <div className="space-y-3">
          {faqs.slice(0, 6).map((f) => (
            <details key={f._id} className="gc-card p-4">
              <summary className="cursor-pointer text-gc-gold">{f.question}</summary>
              <p className="mt-2 text-sm text-gc-mist">{f.answer}</p>
            </details>
          ))}
        </div>
      </PageContainer>
    </AnimatedSection>
  );
}

export function CTASection({ children }: { children?: ReactNode }) {
  return (
    <Reveal>
      <section className="border-y border-gc-line bg-gyan-cta text-white">
        <PageContainer>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-white">Start today</h2>
              <p className="mt-2 text-white/80">Create a student account or apply as a teacher. Admin is never public.</p>
            </div>
            {children ?? (
              <div className="flex gap-3">
                <MagneticButton href="/register" variant="secondary">Get started</MagneticButton>
                <Link href="/contact" className="gc-btn-ghost-inverse">
                  Talk to us
                </Link>
              </div>
            )}
          </div>
        </PageContainer>
      </section>
    </Reveal>
  );
}
