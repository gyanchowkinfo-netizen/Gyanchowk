export type HomeSectionCopy = {
  kicker: string;
  title: string;
  subtitle: string;
};

export type HomeSectionCopyMap = {
  discovery: HomeSectionCopy;
  featured: HomeSectionCopy;
  platform: HomeSectionCopy;
  mentorship: HomeSectionCopy;
  faculty: HomeSectionCopy;
};

export const DEFAULT_HOME_SECTION_COPY: HomeSectionCopyMap = {
  discovery: {
    kicker: 'Discovery',
    title: 'Choose your path',
    subtitle: 'Focused learning for exams, academics, careers, and technology.',
  },
  featured: {
    kicker: 'Catalogue',
    title: 'Featured courses',
    subtitle: 'Structured programs designed around outcomes, not endless content.',
  },
  platform: {
    kicker: 'Platform',
    title: 'Built for deep work',
    subtitle: 'Personalized video, tests & ranking, doubt support — plus the workspace that holds them together.',
  },
  mentorship: {
    kicker: 'Mentorship',
    title: 'Never stay stuck.',
    subtitle: 'Ask doubts and receive mentor responses in a written thread — built for recorded learning, not a live-class chat.',
  },
  faculty: {
    kicker: 'Faculty',
    title: 'Meet our educators',
    subtitle: 'Approved educators teaching recorded programmes — without live-class noise.',
  },
};

function asString(v: unknown) {
  return typeof v === 'string' ? v.trim() : '';
}

function parseCopy(raw: unknown, fallback: HomeSectionCopy): HomeSectionCopy {
  if (!raw || typeof raw !== 'object') return fallback;
  const row = raw as Record<string, unknown>;
  return {
    kicker: asString(row.kicker) || fallback.kicker,
    title: asString(row.title) || fallback.title,
    subtitle: asString(row.subtitle),
  };
}

export function resolveHomeSectionCopy(settingValue: unknown): HomeSectionCopyMap {
  const raw = settingValue && typeof settingValue === 'object' ? (settingValue as Record<string, unknown>) : {};
  return {
    discovery: parseCopy(raw.discovery, DEFAULT_HOME_SECTION_COPY.discovery),
    featured: parseCopy(raw.featured, DEFAULT_HOME_SECTION_COPY.featured),
    platform: parseCopy(raw.platform, DEFAULT_HOME_SECTION_COPY.platform),
    mentorship: parseCopy(raw.mentorship, DEFAULT_HOME_SECTION_COPY.mentorship),
    faculty: parseCopy(raw.faculty, DEFAULT_HOME_SECTION_COPY.faculty),
  };
}
