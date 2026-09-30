'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import type { CourseDetail } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CourseFAQSectionProps {
  course: CourseDetail;
}

export function CourseFAQSection({ course }: CourseFAQSectionProps) {
  const defaultFaqs = [
    {
      question: 'Who should enroll in this course?',
      answer:
        'This course is crafted for students and aspirants aiming for thorough conceptual mastery, high-performance practice, and competitive rankings. Both beginner students and advanced revision candidates will benefit immensely.',
    },
    {
      question: 'Will I get access to recorded lectures if I miss a live class?',
      answer:
        'Yes, absolutely. Every live lecture is recorded in high definition and made available within your student dashboard along with downloadable lecture notes, formula sheets, and chapter summaries.',
    },
    {
      question: 'How does doubt support work?',
      answer:
        'You can post doubts directly within the student portal anytime 24/7. Our expert subject mentors provide detailed step-by-step video solutions and text explanations, typically within a few hours.',
    },
    {
      question: 'How long is the course validity?',
      answer: `You will receive ${course.validityDays ?? 365} days of complete access to all course videos, test series, and learning materials from the date of enrollment.`,
    },
    {
      question: 'Can I access the content on mobile and desktop?',
      answer:
        'Yes, Gyan Chowk provides seamless cross-platform synchronization. You can learn on any web browser, smartphone, tablet, or laptop.',
    },
  ];

  const faqs = course.faqs?.length ? course.faqs : defaultFaqs;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faqs" className="scroll-mt-28">
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="h-5 w-5 text-amber-600" />
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="grid gap-3.5 lg:grid-cols-2 lg:items-start">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={cn(
                'overflow-hidden rounded-2xl border transition-all duration-200 bg-white',
                isOpen
                  ? 'border-slate-300 shadow-sm ring-1 ring-slate-900/5'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-2xs',
              )}
            >
              <button
                type="button"
                onClick={() => toggleFAQ(idx)}
                className="flex w-full items-center justify-between gap-4 p-4 sm:p-5 text-left transition hover:bg-slate-50/60"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-bold text-slate-900">
                  {faq.question}
                </span>
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform duration-200',
                    isOpen && 'rotate-180 bg-slate-900 text-white',
                  )}
                >
                  <ChevronDown className="h-4 w-4" />
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/30 p-4 sm:p-5 text-xs sm:text-sm leading-relaxed text-slate-600">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
