import { slugify } from '../utils/helpers.js';

export type HomeFacultyCard = {
  slug: string;
  name: string;
  headline: string;
  bio: string;
  details: string;
  experience: string;
  subjects: string[];
  qualifications: string[];
  languages: string[];
  href: string;
  imageUrl: string;
  courseCount: number;
  enrollmentCount: number;
  ratingAvg: number;
  ratingCount: number;
};

const MAX_CARDS = 48;

function asString(v: unknown) {
  return typeof v === 'string' ? v.trim() : '';
}

function asNumber(v: unknown, fallback = 0) {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? Math.max(0, n) : fallback;
}

function asList(v: unknown, limit = 8) {
  if (Array.isArray(v)) {
    return v.map((item) => asString(item)).filter(Boolean).slice(0, limit);
  }
  return asString(v)
    .split(/[,•|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function slugFromHref(href: string) {
  const match = href.match(/^\/teachers\/([^/?#]+)$/i);
  return match ? decodeURIComponent(match[1]) : '';
}

function uniqueSlug(name: string, used: Set<string>, requested = '') {
  const base = slugify(requested || name) || 'teacher';
  let slug = base;
  let n = 2;
  while (used.has(slug)) {
    slug = `${base}-${n++}`;
  }
  used.add(slug);
  return slug;
}

export function parseFacultySetting(value: unknown): HomeFacultyCard[] {
  if (!Array.isArray(value)) return [];
  const items: HomeFacultyCard[] = [];
  const used = new Set<string>();
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    if (row.active === false) continue;
    const name = asString(row.name);
    if (!name) continue;
    const slug = uniqueSlug(name, used, asString(row.slug) || slugFromHref(asString(row.href)));
    items.push({
      slug,
      name,
      headline: asString(row.headline),
      bio: asString(row.bio),
      details: asString(row.details),
      experience: asString(row.experience),
      subjects: asList(row.subjects, 6),
      qualifications: asList(row.qualifications, 12),
      languages: asList(row.languages, 8),
      href: `/teachers/${slug}`,
      imageUrl: asString(row.imageUrl),
      courseCount: asNumber(row.courseCount),
      enrollmentCount: asNumber(row.enrollmentCount),
      ratingAvg: Math.min(5, asNumber(row.ratingAvg)),
      ratingCount: asNumber(row.ratingCount),
    });
  }
  return items.slice(0, MAX_CARDS);
}

export function resolveHomeFaculty(settingValue: unknown): HomeFacultyCard[] {
  return parseFacultySetting(settingValue);
}

export function facultyCardToProfile(card: HomeFacultyCard) {
  return {
    teacher: {
      _id: card.slug,
      name: card.name,
      headline: card.headline,
      bio: card.bio,
      details: card.details,
      experience: card.experience,
      qualifications: card.qualifications,
      avatar: card.imageUrl ? { url: card.imageUrl } : undefined,
      courseCount: card.courseCount,
      enrollmentCount: card.enrollmentCount,
      ratingAvg: card.ratingAvg,
      ratingCount: card.ratingCount,
      subjects: card.subjects,
      languages: card.languages,
      categories: card.subjects,
    },
    courses: [],
    batches: [],
    reviews: [],
  };
}
