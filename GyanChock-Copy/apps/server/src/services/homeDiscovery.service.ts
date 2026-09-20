export type DiscoveryTone = 'navy' | 'blue' | 'violet' | 'cyan' | 'warm';

export type HomeDiscoveryPath = {
  name: string;
  href: string;
  body: string;
  tone: DiscoveryTone;
  icon?: string;
};

const TONES = new Set<DiscoveryTone>(['navy', 'blue', 'violet', 'cyan', 'warm']);

function asString(v: unknown) {
  return typeof v === 'string' ? v.trim() : '';
}

function asTone(v: unknown): DiscoveryTone {
  const t = asString(v) as DiscoveryTone;
  return TONES.has(t) ? t : 'navy';
}

export function buildDefaultHomeDiscovery(): HomeDiscoveryPath[] {
  return [
    { name: 'JEE', href: '/courses?category=JEE', body: 'Build concepts. Practice deeply. Improve your rank.', tone: 'navy', icon: 'graduation' },
    { name: 'NEET', href: '/courses?category=NEET', body: 'Biology, chemistry and physics — taught with quiet precision.', tone: 'blue', icon: 'microscope' },
    { name: 'Boards', href: '/courses?category=Boards', body: 'Class-wise recorded lessons for calm, complete coverage.', tone: 'violet', icon: 'book' },
    {
      name: 'Government Exams',
      href: '/courses?category=Government%20exams',
      body: 'Structured prep for competitive public exams.',
      tone: 'cyan',
      icon: 'landmark',
    },
    { name: 'Programming', href: '/courses?category=Programming', body: 'Write, debug and ship — without the livestream noise.', tone: 'navy', icon: 'code' },
    { name: 'Career', href: '/courses?category=Career', body: 'Skills that travel with you after the exam is over.', tone: 'warm', icon: 'briefcase' },
    { name: 'University', href: '/courses?category=University', body: 'Degree-aligned recorded modules for deeper academic work.', tone: 'blue', icon: 'flask' },
    {
      name: 'Skill Development',
      href: '/courses?category=Career',
      body: 'Practical skills for interviews, tools and workplaces.',
      tone: 'violet',
      icon: 'briefcase',
    },
    { name: 'Mathematics', href: '/courses?q=Mathematics', body: 'From first principles to timed problem sets.', tone: 'cyan', icon: 'sigma' },
    { name: 'Physics', href: '/courses?q=Physics', body: 'See the model. Then practice until it holds.', tone: 'navy', icon: 'flask' },
  ];
}

export function parseDiscoverySetting(value: unknown): HomeDiscoveryPath[] {
  if (!Array.isArray(value)) return [];
  const items: HomeDiscoveryPath[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    if (row.active === false) continue;
    const name = asString(row.name);
    const href = asString(row.href);
    const body = asString(row.body);
    if (!name || !href) continue;
    const icon = asString(row.icon);
    items.push({
      name,
      href,
      body: body || name,
      tone: asTone(row.tone),
      ...(icon ? { icon } : {}),
    });
  }
  return items.slice(0, 24);
}

export function resolveHomeDiscovery(settingValue: unknown): HomeDiscoveryPath[] {
  const custom = parseDiscoverySetting(settingValue);
  if (custom.length) return custom;
  return buildDefaultHomeDiscovery();
}
