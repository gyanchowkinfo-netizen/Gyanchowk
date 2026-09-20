'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, BookOpen, ChevronDown, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/format';
import { SectionHeading } from './SectionHeading';
import { FALLBACK_FAQS } from './content';
import styles from './FinalCTA.module.css';

export function Testimonials({
  reviews,
}: {
  reviews?: Array<{
    _id: string;
    body: string;
    rating?: number;
    verified?: boolean;
    user?: { name?: string };
    course?: { title?: string; category?: string };
  }>;
}) {
  const items = (reviews ?? []).filter((r) => r.body && r.user?.name);
  if (!items.length) return null;

  return (
    <section className="gc-container py-14 md:py-20" aria-labelledby="voices">
      <SectionHeading
        id="voices"
        kicker="Voices"
        title="What learners say"
        subtitle="Published course reviews from enrolled students."
        align="center"
      />
      <ul className="flex snap-x gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible">
        {items.slice(0, 6).map((t) => (
          <li key={t._id} className="w-[85%] shrink-0 snap-start md:w-auto">
            <article className="gc-card h-full p-6">
              {t.rating ? (
                <p className="text-sm text-[color:var(--gyan-gold)]" aria-label={`${t.rating} out of 5`}>
                  {'★'.repeat(Math.round(t.rating))}
                </p>
              ) : null}
              <p className="mt-2 font-display text-xl leading-snug text-gc-black">“{t.body}”</p>
              <p className="mt-6 text-sm text-gc-black">{t.user?.name}</p>
              <p className="text-xs text-gc-mute">
                {[t.course?.title, t.course?.category, t.verified ? 'Verified' : null].filter(Boolean).join(' · ')}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function FAQ({ faqs }: { faqs: Array<{ _id: string; question: string; answer: string }> }) {
  const items = faqs.length ? faqs.slice(0, 9) : [...FALLBACK_FAQS];
  const [open, setOpen] = useState<string | null>(items[0]?._id ?? null);

  return (
    <section className="border-y border-gc-line/70" aria-labelledby="faq">
      <div className="gc-container py-14 md:py-20">
        <div className="mx-auto max-w-3xl">
          <SectionHeading id="faq" kicker="Questions" title="Questions" />
          <div className="divide-y divide-gc-line border-y border-gc-line">
            {items.map((f) => {
              const isOpen = open === f._id;
              return (
                <div key={f._id}>
                  <button
                    type="button"
                    className="flex min-h-12 w-full items-center justify-between gap-4 py-4 text-left"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : f._id)}
                    suppressHydrationWarning
                  >
                    <span className="text-[15px] text-gc-black sm:text-base">{f.question}</span>
                    <ChevronDown size={18} className={cn('shrink-0 text-gc-mute transition-transform duration-200', isOpen ? 'rotate-180' : '')} />
                  </button>
                  <div className={cn('grid transition-[grid-template-rows] duration-300 ease-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <div className="overflow-hidden">
                      <p className="pb-4 text-sm leading-relaxed text-gc-mist">{f.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className={styles.section} aria-labelledby="next-chapter">
      <div className={styles.inner}>
        <div className={styles.kickerRow}>
          <span className={styles.kickerLine} aria-hidden="true" />
          <p className={styles.kicker}>Gyan Chowk</p>
          <span className={styles.kickerLine} aria-hidden="true" />
        </div>
        <h2 id="next-chapter" className={styles.title}>
          Your <span className={styles.accent}>next</span> chapter starts here.
        </h2>
        <p className={styles.body}>
          Create a free account and explore structured learning built for focused progress.
        </p>
        <div className={styles.actions}>
          <Link href="/register" className={styles.primary}>
            Get started
            <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
          </Link>
          <Link href="/courses" className={styles.ghost}>
            <BookOpen size={16} strokeWidth={1.8} aria-hidden="true" />
            Explore courses
          </Link>
          <Link href="/contact" className={styles.ghost}>
            <MessageCircle size={16} strokeWidth={1.8} aria-hidden="true" />
            Talk to us
          </Link>
        </div>
      </div>
    </section>
  );
}
