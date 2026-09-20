export type PlatformTone = 'navy' | 'blue' | 'violet' | 'cyan' | 'warm';

export type HomePlatformFeature = {
  title: string;
  body: string;
  icon: string;
  tone: PlatformTone;
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

const DEFAULT_TONES: PlatformTone[] = ['navy', 'blue', 'violet', 'cyan', 'warm'];

export function buildDefaultHomePlatform(): HomePlatformFeature[] {
  return [
    { title: 'Recorded Courses', body: 'Pause, resume, revisit and learn at your own pace.', icon: 'play', tone: 'navy' },
    { title: 'Ranked Tests', body: 'Timed papers, negative marking, detailed performance insights.', icon: 'trophy', tone: 'blue' },
    { title: 'Doubt Support', body: 'Ask questions and receive structured mentor responses.', icon: 'message', tone: 'violet' },
    { title: 'Progress Tracking', body: "Know what you've completed and what needs attention.", icon: 'chart', tone: 'cyan' },
    { title: 'Certificates', body: 'Complete eligible programs and collect verified certificates.', icon: 'award', tone: 'warm' },
    { title: 'Learning Dashboard', body: 'Everything you need in one focused workspace.', icon: 'layout', tone: 'navy' },
    { title: 'Bookmarks & Notes', body: 'Save important lessons and build your personal revision library.', icon: 'bookmark', tone: 'blue' },
    { title: 'Practice Library', body: 'Topic-wise questions designed for deliberate practice.', icon: 'library', tone: 'violet' },
    { title: 'Structured Paths', body: 'Move through a sequence instead of an endless content dump.', icon: 'path', tone: 'cyan' },
    { title: 'Exam Analytics', body: 'Subject-wise feedback after a paper is submitted.', icon: 'target', tone: 'warm' },
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
    items.push({
      title,
      body: body || title,
      icon: asIcon(row.icon),
      tone: asTone(row.tone, DEFAULT_TONES[index % DEFAULT_TONES.length]),
    });
  }
  return items.slice(0, 20);
}

export function resolveHomePlatform(settingValue: unknown): HomePlatformFeature[] {
  const custom = parsePlatformSetting(settingValue);
  if (custom.length) return custom;
  return buildDefaultHomePlatform();
}
