'use client';

import Image from 'next/image';
import type { TeacherCardData } from '@/lib/types';

export function TeacherQuoteCard({ teacher }: { teacher: TeacherCardData }) {
  if (teacher.quote && teacher.quote.visible === false) return null;

  const quoteText =
    teacher.quote?.text ||
    'Good teaching is not just about information, it is about transformation.';
  const author = teacher.quote?.author || teacher.name || 'Riju';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#EDE4D6] bg-gradient-to-br from-[#FFF9F2] via-[#FAF3E9] to-[#F5EBDD] p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
      {/* Decorative Book Stack Accent in bottom-right */}
      <div className="pointer-events-none absolute -bottom-6 -right-6 h-36 w-36 opacity-35">
        <Image
          src="/courses-featured-cap.jpg"
          alt=""
          fill
          className="object-cover rounded-full"
        />
      </div>

      <div className="relative z-10">
        {/* Large Quote Mark */}
        <span className="font-serif text-4xl sm:text-5xl font-bold leading-none text-[#B3874B] select-none block mb-2">
          “
        </span>

        {/* Quote content */}
        <p className="font-display text-base sm:text-lg font-semibold leading-relaxed text-[#2C241E]">
          {quoteText}
        </p>

        {/* Author */}
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-[#7A5B30]">
          — {author}
        </p>
      </div>
    </div>
  );
}
