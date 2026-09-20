'use client';

import Link from 'next/link';
import { BookOpen, Briefcase, Code2, GraduationCap, Landmark, Microscope } from 'lucide-react';

const LINKS = [
  { name: 'JEE', href: '/courses?category=JEE', Icon: GraduationCap },
  { name: 'NEET', href: '/courses?category=NEET', Icon: Microscope },
  { name: 'Boards', href: '/courses?category=Boards', Icon: BookOpen },
  { name: 'Government Exams', href: '/courses?category=Government%20exams', Icon: Landmark },
  { name: 'Programming', href: '/courses?category=Programming', Icon: Code2 },
  { name: 'Career', href: '/courses?category=Career', Icon: Briefcase },
] as const;

export function CategoryQuickLinks() {
  return (
    <nav className="gc-container pb-4 sm:pb-6" aria-label="Exam and category shortcuts">
      <ul className="flex snap-x gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
        {LINKS.map((item) => {
          const Icon = item.Icon;
          return (
            <li key={item.name} className="min-w-[9.5rem] snap-start sm:min-w-0">
              <Link
                href={item.href}
                className="gc-card gc-card-lift flex h-full items-center gap-2.5 px-3 py-3"
              >
                <span className="gc-icon-well gc-icon-well-sm">
                  <Icon size={16} strokeWidth={1.75} aria-hidden />
                </span>
                <span className="text-sm font-medium text-gc-black">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
