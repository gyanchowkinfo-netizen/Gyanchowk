'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  MessageCircle,
  MessageCircleQuestion,
} from 'lucide-react';
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
    <section className="gc-container py-7 md:py-10" aria-labelledby="voices">
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

interface CategorizedFaq {
  _id: string;
  question: string;
  answer: string;
  categoryLabel: string;
  badgeTone: string;
}

function classifyFaq(q: string, id: string): { categoryLabel: string; badgeTone: string } {
  const text = `${q} ${id}`.toLowerCase();
  if (/cert|diploma|verif/i.test(text)) {
    return { categoryLabel: 'Certificates', badgeTone: 'bg-violet-50 text-violet-800 border-violet-200' };
  }
  if (/pay|checkout|price|fee|refund|wallet/i.test(text)) {
    return { categoryLabel: 'Payments & Access', badgeTone: 'bg-amber-50 text-amber-800 border-amber-200' };
  }
  if (/test|rank|paper|mock|score|negative|timer/i.test(text)) {
    return { categoryLabel: 'Tests & Mocks', badgeTone: 'bg-cyan-50 text-cyan-800 border-cyan-200' };
  }
  if (/doubt|mentor|question|ask|help/i.test(text)) {
    return { categoryLabel: 'Doubts & Mentorship', badgeTone: 'bg-rose-50 text-rose-800 border-rose-200' };
  }
  return { categoryLabel: 'Recorded Learning', badgeTone: 'bg-blue-50 text-blue-800 border-blue-200' };
}

export function FAQ({ faqs }: { faqs: Array<{ _id: string; question: string; answer: string }> }) {
  const rawItems = faqs.length ? faqs : [...FALLBACK_FAQS];
  const items: CategorizedFaq[] = useMemo(() => {
    return rawItems.map((f) => {
      const { categoryLabel, badgeTone } = classifyFaq(f.question, f._id);
      return {
        ...f,
        categoryLabel,
        badgeTone,
      };
    });
  }, [rawItems]);

  const [open, setOpen] = useState<string | null>(items[0]?._id ?? null);

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative overflow-hidden bg-[#FAF7F2] py-14 sm:py-20 border-y border-[#ECE6DE]"
    >
      {/* Subtle depth */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(247,242,233,0.7),transparent_65%)]"
        aria-hidden="true"
      />

      <div className="gc-container relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          {/* Badge with horizontal lines */}
          <div className="inline-flex items-center gap-2.5 mb-3.5">
            <span className="w-5 h-px bg-[#D6CBBB]" aria-hidden="true" />
            <span className="inline-block rounded-full bg-[#FAF0E4] border border-[#E8DCC8] px-3.5 py-0.5 text-[11px] font-bold tracking-[0.18em] uppercase text-[#8C6228]">
              QUESTIONS & ANSWERS
            </span>
            <span className="w-5 h-px bg-[#D6CBBB]" aria-hidden="true" />
          </div>

          <h2
            id="faq-heading"
            className="font-serif text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-[#0F172A] leading-[1.14]"
          >
            Questions you might{' '}
            <span className="font-serif italic font-normal text-[#B87B2E]">
              have
            </span>
          </h2>

          <p className="mt-3.5 text-xs sm:text-[14px] text-slate-500 font-normal leading-relaxed">
            Everything you need to know about our recorded learning model, assessments, certificates, and student support.
          </p>
        </div>

        {/* ACCORDION CARDS */}
        <div className="space-y-3.5 max-w-3xl mx-auto">
          {items.map((f, idx) => {
            const isOpen = open === f._id;
            return (
              <div
                key={f._id}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? 'border-amber-300/80 bg-white shadow-sm ring-1 ring-amber-400/20'
                    : 'border-stone-200/80 bg-white hover:border-stone-300 hover:shadow-2xs'
                }`}
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 p-5 sm:p-5.5 text-left transition hover:bg-stone-50/50"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : f._id)}
                  suppressHydrationWarning
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-100 font-mono text-[11px] font-bold text-stone-500 mt-0.5">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <span className="font-serif text-[16.5px] sm:text-[18px] font-bold text-stone-900 leading-snug block">
                        {f.question}
                      </span>
                      <span
                        className={`mt-1.5 inline-block rounded-full border px-2 py-0.2 text-[10px] font-bold uppercase tracking-wider ${f.badgeTone}`}
                      >
                        {f.categoryLabel}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-all duration-200 mt-0.5 ${
                      isOpen
                        ? 'rotate-180 border-stone-900 bg-stone-900 text-white'
                        : 'border-stone-200 bg-stone-50 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {/* Expandable Answer */}
                <div
                  className={cn(
                    'grid transition-[grid-template-rows] duration-250 ease-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-stone-100 bg-[#FAF8F5]/60 px-5 sm:px-6 py-4.5 text-xs sm:text-[14px] leading-relaxed text-stone-600">
                      <p>{f.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM HELP DESK CARD */}
        <div className="mt-12 max-w-3xl mx-auto rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-900">
              <MessageCircleQuestion className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-stone-900">
                Have a question that isn&apos;t listed here?
              </h4>
              <p className="mt-0.5 text-xs sm:text-sm text-stone-500">
                Our support team and academic coordinators are ready to help you with enrollments, batches, or study queries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <Link
              href="/contact"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-stone-900 px-5 py-2 text-xs font-semibold text-white hover:bg-black transition w-full sm:w-auto"
            >
              <span>Ask Support</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/help"
              className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition w-full sm:w-auto"
            >
              Help Centre
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return null;
}
