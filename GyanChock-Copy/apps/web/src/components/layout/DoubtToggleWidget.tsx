'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function DoubtToggleWidget() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Hide if already on doubts page to prevent clutter
  if (pathname.includes('/doubts')) {
    return null;
  }

  // Determine dashboard destination based on user role
  const doubtHref = user
    ? user.role === 'teacher'
      ? '/teacher/doubts'
      : user.role === 'admin'
      ? '/admin/doubts'
      : '/student/doubts'
    : '/student/doubts';

  return (
    <aside
      className="fixed right-3 sm:right-6 top-1/2 -translate-y-1/2 z-40 select-none print:hidden"
      aria-label="Quick Doubt Access"
    >
      <Link
        href={doubtHref}
        className="group relative flex flex-col items-center justify-center h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-stone-900 text-amber-200 border-2 border-amber-400/40 shadow-[0_8px_25px_rgba(0,0,0,0.28)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.35)] hover:bg-black hover:scale-110 active:scale-95 transition-all duration-200"
        aria-label="Doubt"
      >
        {/* Pulsing Active Status Dot */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5" aria-hidden>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 border border-stone-900" />
        </span>

        {/* Center Icon */}
        <HelpCircle
          size={22}
          className="text-amber-300 transition-transform duration-200 group-hover:rotate-12"
          aria-hidden
        />

        {/* Label */}
        <span className="text-[10px] font-bold tracking-wider uppercase text-amber-200 group-hover:text-amber-100 transition-colors">
          Doubt
        </span>
      </Link>
    </aside>
  );
}
