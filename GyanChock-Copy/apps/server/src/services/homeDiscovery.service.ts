import { asAccent, asOrder, asSafeMediaUrl, type HomeCardAccent } from './homeWhy.service.js';

export type DiscoveryTone = 'navy' | 'blue' | 'violet' | 'cyan' | 'warm';

export type HomeDiscoveryPath = {
  name: string;
  href: string;
  body: string;
  tone: DiscoveryTone;
  icon?: string;
  imageUrl?: string;
  ctaText?: string;
  accent?: HomeCardAccent;
  order?: number;
};

const TONES = new Set<DiscoveryTone>(['navy', 'blue', 'violet', 'cyan', 'warm']);
const DEFAULT_ACCENTS: HomeCardAccent[] = ['blue', 'lavender', 'cyan', 'mint', 'peach', 'pink', 'blue', 'lavender', 'cyan', 'mint'];

function asString(v: unknown) {
  return typeof v === 'string' ? v.trim() : '';
}

function asTone(v: unknown): DiscoveryTone {
  const t = asString(v) as DiscoveryTone;
  return TONES.has(t) ? t : 'navy';
}

export function buildDefaultHomeDiscovery(): HomeDiscoveryPath[] {
  return [
    { name: 'JEE', href: '/courses?category=JEE', body: 'Build concepts. Practice deeply. Improve your rank.', tone: 'navy', icon: 'graduation', imageUrl: '/overlays/overlay-jee.png', ctaText: 'Explore →', accent: 'blue', order: 1 },
    { name: 'NEET', href: '/courses?category=NEET', body: 'Biology, chemistry and physics — taught with quiet precision.', tone: 'blue', icon: 'microscope', imageUrl: '/overlays/overlay-neet.png', ctaText: 'Explore →', accent: 'lavender', order: 2 },
    { name: 'Boards', href: '/courses?category=Boards', body: 'Class-wise recorded lessons for calm, complete coverage.', tone: 'violet', icon: 'book', imageUrl: '/overlays/overlay-boards.png', ctaText: 'Explore →', accent: 'cyan', order: 3 },
    { name: 'Government Exams', href: '/courses?category=Government%20exams', body: 'Structured prep for competitive public exams.', tone: 'cyan', icon: 'landmark', imageUrl: '/overlays/overlay-government.png', ctaText: 'Explore →', accent: 'mint', order: 4 },
    { name: 'Programming', href: '/courses?category=Programming', body: 'Write, debug and ship — without the livestream noise.', tone: 'navy', icon: 'code', imageUrl: '/overlays/overlay-programming.png', ctaText: 'Explore →', accent: 'peach', order: 5 },
    { name: 'Career', href: '/courses?category=Career', body: 'Skills that travel with you after the exam is over.', tone: 'warm', icon: 'briefcase', imageUrl: '/overlays/overlay-career.png', ctaText: 'Explore →', accent: 'pink', order: 6 },
    { name: 'University', href: '/courses?category=University', body: 'Degree-aligned recorded modules for deeper academic work.', tone: 'blue', icon: 'flask', imageUrl: '/overlays/overlay-university.png', ctaText: 'Explore →', accent: 'blue', order: 7 },
    { name: 'Skill Development', href: '/courses?category=Career', body: 'Practical skills for interviews, tools and workplaces.', tone: 'violet', icon: 'briefcase', imageUrl: '/overlays/overlay-skills.png', ctaText: 'Explore →', accent: 'lavender', order: 8 },
    { name: 'Mathematics', href: '/courses?q=Mathematics', body: 'From first principles to timed problem sets.', tone: 'cyan', icon: 'sigma', imageUrl: '/overlays/overlay-mathematics.png', ctaText: 'Explore →', accent: 'cyan', order: 9 },
    { name: 'Physics', href: '/courses?q=Physics', body: 'See the model. Then practice until it holds.', tone: 'navy', icon: 'flask', imageUrl: '/overlays/overlay-physics.png', ctaText: 'Explore →', accent: 'mint', order: 10 },
  ];
}

export function parseDiscoverySetting(value: unknown): HomeDiscoveryPath[] {
  if (!Array.isArray(value)) return [];
  const items: HomeDiscoveryPath[] = [];
  for (const [index, raw] of value.entries()) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    if (row.active === false) continue;
    const name = asString(row.name) || asString(row.title);
    const href = asSafeMediaUrl(row.href) || asSafeMediaUrl(row.ctaUrl);
    const body = asString(row.body);
    if (!name || !href) continue;
    const icon = asString(row.icon);
    const imageUrl = asSafeMediaUrl(row.imageUrl);
    const ctaText = asString(row.ctaText).slice(0, 40);
    items.push({
      name,
      href,
      body: body || name,
      tone: asTone(row.tone),
      accent: asAccent(row.accent, DEFAULT_ACCENTS[index % DEFAULT_ACCENTS.length]),
      order: asOrder(row.order, index + 1),
      ...(icon ? { icon } : {}),
      ...(imageUrl ? { imageUrl } : {}),
      ...(ctaText ? { ctaText } : {}),
    });
  }
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).slice(0, 24);
}

export function resolveHomeDiscovery(settingValue: unknown): HomeDiscoveryPath[] {
  const custom = parseDiscoverySetting(settingValue);
  if (custom.length) return custom;
  return buildDefaultHomeDiscovery();
}
