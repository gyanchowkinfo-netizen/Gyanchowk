'use client';

import Link from 'next/link';
import { cn } from '@/lib/format';
import type { HomeFacultyCard, TeacherCardData } from '@/lib/types';

export type FacultyPortraitItem = {
  id: string;
  name: string;
  subject: string;
  imageUrl?: string;
  href: string;
};

function initials(name?: string) {
  return (name ?? 'G')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function fromCmsFaculty(card: HomeFacultyCard, index: number): FacultyPortraitItem {
  const slug = card.slug || `${card.name}-${index}`;
  return {
    id: slug,
    name: card.name,
    subject: card.subjects[0] || card.headline || '',
    imageUrl: card.imageUrl || undefined,
    href: card.href || `/teachers/${slug}`,
  };
}

export function fromCatalogTeacher(teacher: TeacherCardData): FacultyPortraitItem {
  const subjects = (teacher.subjects?.length ? teacher.subjects : teacher.categories) ?? [];
  return {
    id: teacher._id,
    name: teacher.name,
    subject: subjects[0] || teacher.headline || '',
    imageUrl: teacher.avatar?.url,
    href: `/teachers/${teacher._id}`,
  };
}

export function FacultyPortraitCard({
  item,
  active = true,
}: {
  item: FacultyPortraitItem;
  active?: boolean;
}) {
  return (
    <article className={cn('gc-faculty-card', active && 'is-active')}>
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt="" />
      ) : (
        <div className="gc-faculty-fallback" aria-hidden>
          {initials(item.name)}
        </div>
      )}
      <div className="gc-faculty-overlay">
        <h3>{item.name}</h3>
        {item.subject ? <p>{item.subject}</p> : null}
        <Link href={item.href} className="gc-faculty-profile" tabIndex={active ? 0 : -1}>
          View Profile <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}
