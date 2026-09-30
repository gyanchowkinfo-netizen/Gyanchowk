export type WhyTone = 'navy' | 'blue' | 'violet' | 'cyan' | 'warm';
export type HomeCardAccent = 'blue' | 'lavender' | 'cyan' | 'mint' | 'peach' | 'pink';

export type HomeWhyCard = {
  title: string;
  body: string;
  tone: WhyTone;
  accent: HomeCardAccent;
  imageUrl?: string;
  href?: string;
  ctaText?: string;
  order?: number;
};

const TONES = new Set<WhyTone>(['navy', 'blue', 'violet', 'cyan', 'warm']);
const ACCENTS = new Set<HomeCardAccent>(['blue', 'lavender', 'cyan', 'mint', 'peach', 'pink']);
const DEFAULT_TONES: WhyTone[] = ['navy', 'violet', 'blue', 'warm', 'cyan', 'blue', 'warm', 'navy'];
const DEFAULT_ACCENTS: HomeCardAccent[] = ['blue', 'lavender', 'mint', 'peach', 'cyan', 'blue', 'pink', 'lavender'];

function asString(v: unknown) {
  return typeof v === 'string' ? v.trim() : '';
}

export function asSafeMediaUrl(v: unknown) {
  const s = asString(v).slice(0, 800);
  if (!s) return '';
  if (s.startsWith('/') || s.startsWith('https://') || s.startsWith('http://localhost') || /^https?:\/\//.test(s)) {
    if (s.toLowerCase().startsWith('javascript:')) return '';
    return s;
  }
  return '';
}

export function asAccent(v: unknown, fallback: HomeCardAccent = 'blue'): HomeCardAccent {
  const t = asString(v) as HomeCardAccent;
  return ACCENTS.has(t) ? t : fallback;
}

export function asTone(v: unknown, fallback: WhyTone = 'navy'): WhyTone {
  const t = asString(v) as WhyTone;
  return TONES.has(t) ? t : fallback;
}

export function asOrder(v: unknown, fallback: number) {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(999, Math.round(n))) : fallback;
}

export function buildDefaultHomeWhy(): HomeWhyCard[] {
  return [
    {
      title: 'Structured learning',
      body: 'Paths built around exams, subjects and skills — not a livestream calendar.',
      tone: 'navy',
      accent: 'blue',
      imageUrl: '/overlays/overlay-library.png',
      order: 1,
    },
    {
      title: 'Expert faculty',
      body: 'Approved educators, listed with the subjects they actually teach.',
      tone: 'violet',
      accent: 'lavender',
      imageUrl: '/overlays/overlay-faculty.png',
      order: 2,
    },
    {
      title: 'Recorded lessons',
      body: 'Pause, rewind and revisit until the idea holds.',
      tone: 'blue',
      accent: 'mint',
      imageUrl: '/overlays/overlay-recorded.png',
      order: 3,
    },
    {
      title: 'Practice & testing',
      body: 'Timed papers with ranks computed after you submit.',
      tone: 'warm',
      accent: 'peach',
      imageUrl: '/overlays/overlay-notes.png',
      order: 4,
    },
    {
      title: 'Progress tracking',
      body: 'Completion lives on the server, not in a browser tab.',
      tone: 'cyan',
      accent: 'cyan',
      imageUrl: '/overlays/overlay-progress.png',
      order: 5,
    },
    {
      title: 'Mentor support',
      body: 'Doubts become threads. Answers stay with the lesson.',
      tone: 'blue',
      accent: 'blue',
      imageUrl: '/mentorship-workspace.png',
      order: 6,
    },
    {
      title: 'Verified courses',
      body: 'Access unlocks after payment is confirmed on the server.',
      tone: 'warm',
      accent: 'pink',
      imageUrl: '/overlays/overlay-university.png',
      order: 7,
    },
    {
      title: 'Certificates',
      body: 'Issued when completion rules for an eligible programme are met.',
      tone: 'navy',
      accent: 'lavender',
      imageUrl: '/overlays/overlay-certificate.png',
      order: 8,
    },
  ];
}

export function parseWhySetting(value: unknown, { includeInactive = false } = {}): HomeWhyCard[] {
  if (!Array.isArray(value)) return [];
  const items: HomeWhyCard[] = [];
  for (const [index, raw] of value.entries()) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    if (!includeInactive && row.active === false) continue;
    const title = asString(row.title);
    const body = asString(row.body);
    if (!title) continue;
    const imageUrl = asSafeMediaUrl(row.imageUrl);
    const href = asSafeMediaUrl(row.href) || asSafeMediaUrl(row.ctaUrl);
    const ctaText = asString(row.ctaText).slice(0, 40);
    items.push({
      title,
      body: body || title,
      tone: asTone(row.tone, DEFAULT_TONES[index % DEFAULT_TONES.length]),
      accent: asAccent(row.accent, DEFAULT_ACCENTS[index % DEFAULT_ACCENTS.length]),
      order: asOrder(row.order, index + 1),
      ...(imageUrl ? { imageUrl } : {}),
      ...(href ? { href } : {}),
      ...(ctaText ? { ctaText } : {}),
    });
  }
  return items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).slice(0, 24);
}

export function resolveHomeWhy(settingValue: unknown): HomeWhyCard[] {
  const custom = parseWhySetting(settingValue);
  if (custom.length) return custom;
  return buildDefaultHomeWhy();
}
