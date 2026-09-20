export type HomeHighlight = {
  value: string;
  title: string;
  description: string;
};

export type HomeHighlightCounts = {
  students: number;
  teachers: number;
  courses: number;
  batches: number;
  tests: number;
  materials: number;
};

export function formatHighlightCount(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n >= 1_000_000) {
    const millions = n / 1_000_000;
    const rounded = millions >= 10 ? String(Math.floor(millions)) : millions.toFixed(1).replace(/\.0$/, '');
    return `${rounded} Million+`;
  }
  if (n >= 10_000) return `${Math.floor(n / 1000)}K+`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K+`;
  if (n >= 100) return `${Math.floor(n / 100) * 100}+`;
  return `${n}+`;
}

function asString(v: unknown) {
  return typeof v === 'string' ? v.trim() : '';
}

export function parseHighlightsSetting(value: unknown): HomeHighlight[] {
  if (!Array.isArray(value)) return [];
  const items: HomeHighlight[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    if (row.active === false) continue;
    const highlightValue = asString(row.value);
    const title = asString(row.title);
    const description = asString(row.description ?? row.subtitle);
    if (!highlightValue || !title) continue;
    items.push({ value: highlightValue, title, description: description || title });
  }
  return items.slice(0, 12);
}

export function buildDefaultHomeHighlights(counts: HomeHighlightCounts): HomeHighlight[] {
  const courseValue = formatHighlightCount(counts.courses + counts.batches) || 'Structured';
  const practiceTotal = counts.tests + counts.materials;
  const practiceValue = formatHighlightCount(practiceTotal) || (practiceTotal > 0 ? `${practiceTotal}+` : 'Practice');
  const educatorValue = formatHighlightCount(counts.teachers) || (counts.teachers > 0 ? `${counts.teachers}+` : 'Expert');

  return [
    {
      value: courseValue,
      title: 'Structured courses',
      description: 'Recorded lessons, batches and exam-focused learning paths',
    },
    {
      value: practiceValue,
      title: 'Tests, papers & notes',
      description: 'Mocks, topic tests and study materials in one practice library',
    },
    {
      value: '24 × 7',
      title: 'Doubt support',
      description: 'Written mentor threads when you need clarity between sessions',
    },
    {
      value: educatorValue,
      title: 'Expert educators',
      description: 'Verified instructors guiding learners with purpose',
    },
  ];
}

export function resolveHomeHighlights(settingValue: unknown, counts: HomeHighlightCounts): HomeHighlight[] {
  const custom = parseHighlightsSetting(settingValue);
  if (custom.length) return custom;
  return buildDefaultHomeHighlights(counts);
}
