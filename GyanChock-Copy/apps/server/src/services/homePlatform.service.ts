import { asAccent, asOrder, asSafeMediaUrl, type HomeCardAccent } from './homeWhy.service.js';

export type PlatformTone = 'navy' | 'blue' | 'violet' | 'cyan' | 'warm';

export type HomePlatformFeature = {
  title: string;
  body: string;
  icon: string;
  tone: PlatformTone;
  imageUrl?: string;
  href?: string;
  ctaText?: string;
  accent?: HomeCardAccent;
  order?: number;
};

const TONES = new Set<PlatformTone>(['navy', 'blue', 'violet', 'cyan', 'warm']);
const ICONS = new Set([
  'play',
  'trophy',
  'message',
  'chart',
  'award',
  'layout',
  'bookmark',
  'library',
  'path',
  'target',
  'clock',
  'shield',
  'notes',
  'users',
  'book',
]);
const DEFAULT_TONES: PlatformTone[] = ['navy', 'blue', 'violet', 'cyan', 'warm'];
const DEFAULT_ACCENTS: HomeCardAccent[] = ['blue', 'lavender', 'cyan', 'mint', 'peach', 'pink', 'blue', 'lavender', 'cyan', 'mint'];

function asString(v: unknown) {
  return typeof v === 'string' ? v.trim() : '';
}

function asTone(v: unknown, fallback: PlatformTone = 'navy'): PlatformTone {
  const t = asString(v) as PlatformTone;
  return TONES.has(t) ? t : fallback;
}

function asIcon(v: unknown, fallback = 'play') {
  const icon = asString(v);
  return ICONS.has(icon) ? icon : fallback;
}

export function buildDefaultHomePlatform(): HomePlatformFeature[] {
  return [
    { title: 'Recorded Courses', body: 'Revisit, practice, recall and learn at your own pace.', icon: 'play', tone: 'navy', imageUrl: '/overlays/overlay-recorded.png', href: '/courses', ctaText: 'Explore →', accent: 'blue', order: 1 },
    { title: 'Ranked Tests', body: 'Timed papers, real-time marking, detailed performance insights.', icon: 'trophy', tone: 'blue', imageUrl: '/overlays/overlay-notes.png', href: '/student/tests', ctaText: 'Explore →', accent: 'lavender', order: 2 },
    { title: 'Doubt Support', body: 'Ask questions and receive structured mentor responses.', icon: 'message', tone: 'violet', imageUrl: '/mentorship-workspace.png', href: '/student/doubts', ctaText: 'Explore →', accent: 'cyan', order: 3 },
    { title: 'Progress Tracking', body: "Know what you've completed and what needs attention.", icon: 'chart', tone: 'cyan', imageUrl: '/overlays/overlay-progress.png', href: '/student', ctaText: 'Explore →', accent: 'mint', order: 4 },
    { title: 'Certificates', body: 'Complete eligible programs and receive verified certificates.', icon: 'award', tone: 'warm', imageUrl: '/overlays/overlay-certificate.png', href: '/student/certificates', ctaText: 'Explore →', accent: 'peach', order: 5 },
    { title: 'Learning Dashboard', body: 'Everything you need in one focused workspace.', icon: 'layout', tone: 'navy', imageUrl: '/practice-workspace.png', href: '/student', ctaText: 'Explore →', accent: 'pink', order: 6 },
    { title: 'Bookmarks & Notes', body: 'Save important lessons, attach your personal notes and library.', icon: 'bookmark', tone: 'blue', imageUrl: '/overlays/overlay-notes.png', href: '/student', ctaText: 'Explore →', accent: 'blue', order: 7 },
    { title: 'Practice Library', body: 'Topic-wise questions designed for deliberate practice.', icon: 'library', tone: 'violet', imageUrl: '/overlays/overlay-library.png', href: '/student/tests', ctaText: 'Explore →', accent: 'lavender', order: 8 },
    { title: 'Structured Paths', body: 'Move through a sequence matched to your learning goals.', icon: 'path', tone: 'cyan', imageUrl: '/overlays/overlay-skills.png', href: '/courses', ctaText: 'Explore →', accent: 'cyan', order: 9 },
    { title: 'Exam Analytics', body: 'Subject-wise feedback after a paper to understand strengths and gaps.', icon: 'target', tone: 'warm', imageUrl: '/overlays/overlay-progress.png', href: '/student/tests', ctaText: 'Explore →', accent: 'mint', order: 10 },
  ];
}

export function parsePlatformSetting(value: unknown): HomePlatformFeature[] {
  if (!Array.isArray(value)) return [];
  const items: HomePlatformFeature[] = [];
  for (const [index, raw] of value.entries()) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    if (row.active === false) continue;
    const title = asString(row.title);
    const body = asString(row.body);
    if (!title) continue;
    const imageUrl = asSafeMediaUrl(row.imageUrl);
    const href = asSafeMediaUrl(row.href) || asSafeMediaUrl(row.ctaUrl);
    const ctaText = asString(row.ctaText).slice(0, 40);
    items.push({
      title,
      body: body || title,
      icon: asIcon(row.icon),
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

export function resolveHomePlatform(settingValue: unknown): HomePlatformFeature[] {
  const custom = parsePlatformSetting(settingValue);
  if (custom.length) return custom;
  return buildDefaultHomePlatform();
}
