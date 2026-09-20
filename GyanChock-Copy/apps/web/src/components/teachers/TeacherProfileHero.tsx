'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui/Badge';
import {
  CountUp,
  FloatingElement,
  Reveal,
  ScaleIn,
  StaggerContainer,
  StaggerItem,
  TextReveal,
  TiltCard,
} from '@/components/motion';
import type { TeacherCardData } from '@/lib/types';

export function TeacherProfileHero({
  teacher,
  hasCourses = true,
}: {
  teacher: TeacherCardData;
  hasCourses?: boolean;
}) {
  const subjects = teacher.subjects?.length ? teacher.subjects : teacher.categories ?? [];
  return (
    <section className="relative grid gap-8 overflow-hidden rounded-3xl border border-gc-line bg-white p-5 sm:p-6 md:grid-cols-[280px_1fr] md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(30,111,255,0.14),transparent_46%)]" />
      <ScaleIn>
        <TiltCard intensity={5} className="relative mx-auto w-fit">
          <div className="relative rounded-[2rem] bg-gradient-to-br from-gc-blue/25 via-gc-gold/20 to-transparent p-[2px] shadow-lg">
            <div className="rounded-[1.9rem] bg-white p-3">
              <Avatar name={teacher.name} src={teacher.avatar?.url} size={196} />
            </div>
          </div>
          {subjects[0] ? (
            <FloatingElement duration={4} className="absolute -right-6 top-4">
              <span className="gc-card px-2 py-1 text-[10px]">{subjects[0]}</span>
            </FloatingElement>
          ) : null}
          {subjects[1] ? (
            <FloatingElement duration={5} className="absolute -left-5 top-24">
              <span className="gc-card px-2 py-1 text-[10px]">{subjects[1]}</span>
            </FloatingElement>
          ) : null}
          {teacher.ratingCount ? (
            <FloatingElement duration={4.5} className="absolute -left-4 bottom-6">
              <span className="gc-card px-2 py-1 text-[10px]">★ {teacher.ratingAvg?.toFixed(1)}</span>
            </FloatingElement>
          ) : null}
        </TiltCard>
      </ScaleIn>
      <div className="relative">
        <Reveal>
          <p className="gc-kicker">Approved faculty</p>
        </Reveal>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-gc-black sm:text-4xl md:text-5xl">
          <TextReveal text={teacher.name} />
        </h1>
        {teacher.headline ? <p className="mt-2 text-lg text-gc-blue">{teacher.headline}</p> : null}
        <Reveal delay={0.06}>
          <p className="mt-4 max-w-2xl text-gc-mist">{teacher.bio}</p>
        </Reveal>
        {subjects.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {subjects.map((s) => (
              <span key={s} className="rounded-full border border-gc-line px-3 py-1 text-xs text-gc-mist">
                {s}
              </span>
            ))}
          </div>
        ) : null}
        <StaggerContainer className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Courses', teacher.courseCount ?? 0, 0],
            ['Enrollments', teacher.enrollmentCount ?? 0, 0],
            ['Reviews', teacher.ratingCount ?? 0, 0],
            ['Rating', teacher.ratingCount ? Number((teacher.ratingAvg ?? 0).toFixed(1)) : 0, 1],
          ].map(([label, value, digits]) => (
            <StaggerItem key={String(label)}>
              <div className="gc-card p-3">
                <p className="text-xs text-gc-mute">{label}</p>
                <p className="font-display text-xl text-gc-black">
                  {label === 'Rating' && !teacher.ratingCount ? '—' : <CountUp value={Number(value)} digits={Number(digits)} />}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
        <Reveal delay={0.08}>
          <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap">
            {hasCourses ? (
              <Link href="#teacher-courses" className="gc-btn-primary w-full sm:w-auto">
                View courses <span className="gc-btn-arrow">→</span>
              </Link>
            ) : null}
            <Link href="/register" className={hasCourses ? 'gc-btn-ghost w-full sm:w-auto' : 'gc-btn-primary w-full sm:w-auto'}>
              Start learning
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
