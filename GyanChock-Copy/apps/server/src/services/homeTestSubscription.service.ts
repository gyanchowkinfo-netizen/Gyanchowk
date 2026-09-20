export const TEST_SUBSCRIPTION_ICONS = [
  'ClipboardCheck',
  'BookOpen',
  'Layers',
  'LibraryBig',
  'Files',
  'TrendingUp',
  'Target',
  'Timer',
  'PenLine',
  'ChartNoAxesCombined',
  'GraduationCap',
  'BarChart3',
  'Landmark',
  'Building2',
  'TrainFront',
  'Award',
] as const;

export type TestSubscriptionIcon = (typeof TEST_SUBSCRIPTION_ICONS)[number];

export const TEST_PRIME_VARIANTS = ['blue', 'navy', 'warm', 'gold', 'cyan'] as const;
export type TestPrimeVariant = (typeof TEST_PRIME_VARIANTS)[number];

export const TEST_PRIME_POSITIONS = [
  'top-left',
  'top-right',
  'mid-left',
  'mid-right',
  'bottom-left',
  'bottom-right',
] as const;
export type TestPrimePosition = (typeof TEST_PRIME_POSITIONS)[number];

const ICON_SET = new Set<string>(TEST_SUBSCRIPTION_ICONS);
const VARIANT_SET = new Set<string>(TEST_PRIME_VARIANTS);
const POSITION_SET = new Set<string>(TEST_PRIME_POSITIONS);

export type TestSubscriptionBenefit = {
  id: string;
  value: string;
  title: string;
  description: string;
  icon: TestSubscriptionIcon;
  variant: TestPrimeVariant;
  order: number;
  isActive: boolean;
};

export type TestPrimeFloatingCard = {
  id: string;
  icon: TestSubscriptionIcon;
  title: string;
  description: string;
  position: TestPrimePosition;
  order: number;
  isActive: boolean;
};

export type TestPrimeExamBadge = {
  id: string;
  name: string;
  icon: TestSubscriptionIcon;
  variant: TestPrimeVariant;
  position: TestPrimePosition;
  order: number;
  isActive: boolean;
};

export type HomeTestSubscription = {
  isActive: boolean;
  eyebrow: string;
  badgeLabel: string;
  title: string;
  highlightedTitle: string;
  description: string;
  motivationalText: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  heroImage: string;
  heroImageAlt: string;
  backgroundImage: string;
  benefits: TestSubscriptionBenefit[];
  floatingCards: TestPrimeFloatingCard[];
  examBadges: TestPrimeExamBadge[];
};

function asString(v: unknown, max = 400) {
  if (typeof v !== 'string') return '';
  return v.replace(/\s+/g, ' ').trim().slice(0, max);
}

function asMultiline(v: unknown, max = 160) {
  if (typeof v !== 'string') return '';
  return v.replace(/\r\n/g, '\n').trim().slice(0, max);
}

function asId(v: unknown, fallback: string) {
  const id = asString(v, 64).replace(/[^a-zA-Z0-9_-]/g, '');
  return id || fallback;
}

function asIcon(v: unknown, fallback: TestSubscriptionIcon = 'ClipboardCheck'): TestSubscriptionIcon {
  const icon = asString(v, 48);
  return ICON_SET.has(icon) ? (icon as TestSubscriptionIcon) : fallback;
}

function asVariant(v: unknown, fallback: TestPrimeVariant = 'blue'): TestPrimeVariant {
  const variant = asString(v, 16);
  return VARIANT_SET.has(variant) ? (variant as TestPrimeVariant) : fallback;
}

function asPosition(v: unknown, fallback: TestPrimePosition = 'top-right'): TestPrimePosition {
  const position = asString(v, 24);
  return POSITION_SET.has(position) ? (position as TestPrimePosition) : fallback;
}

function asHref(v: unknown, fallback: string) {
  const href = asString(v, 500);
  if (!href) return fallback;
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  try {
    const url = new URL(href);
    if (url.protocol === 'http:' || url.protocol === 'https:') return href;
  } catch {
    /* ignore */
  }
  return fallback;
}

function asBool(v: unknown, fallback = true) {
  if (typeof v === 'boolean') return v;
  return fallback;
}

const BENEFIT_VARIANTS: TestPrimeVariant[] = ['blue', 'navy', 'warm'];
const FLOAT_POSITIONS: TestPrimePosition[] = ['top-right', 'mid-left', 'bottom-left', 'bottom-right'];
const BADGE_POSITIONS: TestPrimePosition[] = ['top-left', 'mid-right', 'bottom-left', 'bottom-right'];
const BADGE_VARIANTS: TestPrimeVariant[] = ['navy', 'blue', 'warm', 'gold'];

export function buildDefaultHomeTestSubscription(): HomeTestSubscription {
  return {
    isActive: true,
    eyebrow: 'Test',
    badgeLabel: 'Prime',
    title: 'One Subscription,',
    highlightedTitle: 'Every Mock Test You Need',
    description:
      'Prepare smarter with mock tests, previous year papers, and exam-focused practice — all designed to help you build confidence and track your progress.',
    motivationalText: 'Better Practice\nBigger Dreams',
    primaryButtonText: 'Explore Test Prime',
    primaryButtonLink: '/student/tests',
    secondaryButtonText: '',
    secondaryButtonLink: '',
    heroImage: '/test-prime-student.png',
    heroImageAlt: 'Student preparing for competitive exams with Gyan Chowk Test Prime',
    backgroundImage: '',
    benefits: [
      {
        id: 'mock-tests',
        value: '1.5 Lakh+',
        title: 'Mock Tests',
        description: 'Covering SSC, Banking, UPSC, Railways & more',
        icon: 'ClipboardCheck',
        variant: 'blue',
        order: 1,
        isActive: true,
      },
      {
        id: 'py-papers',
        value: '25,000+',
        title: 'Previous Year Papers',
        description: 'Learn from previous year question papers',
        icon: 'BookOpen',
        variant: 'navy',
        order: 2,
        isActive: true,
      },
      {
        id: 'exam-coverage',
        value: '800+',
        title: 'Exam Coverage',
        description: "One subscription, every exam you're targeting",
        icon: 'Target',
        variant: 'warm',
        order: 3,
        isActive: true,
      },
    ],
    floatingCards: [
      {
        id: 'progress',
        icon: 'ChartNoAxesCombined',
        title: 'Track Your Progress',
        description: 'See improvement with detailed reports',
        position: 'top-right',
        order: 1,
        isActive: true,
      },
      {
        id: 'pattern',
        icon: 'ClipboardCheck',
        title: 'Real Exam Pattern',
        description: 'Practice the way the paper is set',
        position: 'mid-left',
        order: 2,
        isActive: true,
      },
      {
        id: 'smarter',
        icon: 'PenLine',
        title: 'Practice Smarter',
        description: 'Timed mocks with autosave',
        position: 'bottom-left',
        order: 3,
        isActive: true,
      },
      {
        id: 'performance',
        icon: 'TrendingUp',
        title: 'Detailed Performance',
        description: 'Accuracy, time and section analysis',
        position: 'bottom-right',
        order: 4,
        isActive: true,
      },
    ],
    examBadges: [
      {
        id: 'upsc',
        name: 'UPSC',
        icon: 'GraduationCap',
        variant: 'navy',
        position: 'top-left',
        order: 1,
        isActive: true,
      },
      {
        id: 'ssc',
        name: 'SSC',
        icon: 'Files',
        variant: 'blue',
        position: 'mid-right',
        order: 2,
        isActive: true,
      },
      {
        id: 'banking',
        name: 'Banking',
        icon: 'Landmark',
        variant: 'warm',
        position: 'bottom-left',
        order: 3,
        isActive: true,
      },
      {
        id: 'railways',
        name: 'Railways',
        icon: 'TrainFront',
        variant: 'gold',
        position: 'bottom-right',
        order: 4,
        isActive: true,
      },
    ],
  };
}

function parseBenefits(value: unknown): TestSubscriptionBenefit[] {
  if (!Array.isArray(value)) return [];
  const items: TestSubscriptionBenefit[] = [];
  for (const [index, raw] of value.entries()) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    const title = asString(row.title, 80);
    const description = asString(row.description, 240);
    if (!title || !description) continue;
    items.push({
      id: asId(row.id, `benefit-${index + 1}`),
      value: asString(row.value, 24),
      title,
      description,
      icon: asIcon(row.icon, 'ClipboardCheck'),
      variant: asVariant(row.variant, BENEFIT_VARIANTS[index % BENEFIT_VARIANTS.length] ?? 'blue'),
      order: Number.isFinite(Number(row.order)) ? Number(row.order) : index + 1,
      isActive: asBool(row.isActive, row.active !== false),
    });
  }
  return items.sort((a, b) => a.order - b.order).slice(0, 8);
}

function parseFloatingCards(value: unknown): TestPrimeFloatingCard[] {
  if (!Array.isArray(value)) return [];
  const items: TestPrimeFloatingCard[] = [];
  const fallbackIcons: TestSubscriptionIcon[] = ['ChartNoAxesCombined', 'ClipboardCheck', 'PenLine', 'TrendingUp'];
  for (const [index, raw] of value.entries()) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    const title = asString(row.title ?? row.label, 80);
    if (!title) continue;
    items.push({
      id: asId(row.id, `float-${index + 1}`),
      icon: asIcon(row.icon, fallbackIcons[index % fallbackIcons.length] ?? 'ChartNoAxesCombined'),
      title,
      description: asString(row.description ?? row.value, 160),
      position: asPosition(row.position, FLOAT_POSITIONS[index % FLOAT_POSITIONS.length] ?? 'top-right'),
      order: Number.isFinite(Number(row.order)) ? Number(row.order) : index + 1,
      isActive: asBool(row.isActive, row.active !== false),
    });
  }
  return items.sort((a, b) => a.order - b.order).slice(0, 8);
}

function parseExamBadges(value: unknown): TestPrimeExamBadge[] {
  if (!Array.isArray(value)) return [];
  const items: TestPrimeExamBadge[] = [];
  const fallbackIcons: TestSubscriptionIcon[] = ['GraduationCap', 'Files', 'Landmark', 'TrainFront'];
  for (const [index, raw] of value.entries()) {
    if (!raw || typeof raw !== 'object') continue;
    const row = raw as Record<string, unknown>;
    const name = asString(row.name ?? row.title, 40);
    if (!name) continue;
    items.push({
      id: asId(row.id, `badge-${index + 1}`),
      name,
      icon: asIcon(row.icon, fallbackIcons[index % fallbackIcons.length] ?? 'GraduationCap'),
      variant: asVariant(row.variant, BADGE_VARIANTS[index % BADGE_VARIANTS.length] ?? 'navy'),
      position: asPosition(row.position, BADGE_POSITIONS[index % BADGE_POSITIONS.length] ?? 'bottom-right'),
      order: Number.isFinite(Number(row.order)) ? Number(row.order) : index + 1,
      isActive: asBool(row.isActive, row.active !== false),
    });
  }
  return items.sort((a, b) => a.order - b.order).slice(0, 8);
}

function isLegacyLedger(row: Record<string, unknown>) {
  const title = asString(row.title, 120).toLowerCase().replace(/\.$/, '');
  return (
    title === 'one learning pass' ||
    asString(row.visualMode, 24) === 'ledger' ||
    asString(row.panelTitle, 80) === 'Your exam intelligence'
  );
}

export function parseTestSubscriptionSetting(value: unknown): HomeTestSubscription | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const fallback = buildDefaultHomeTestSubscription();
  const legacy = isLegacyLedger(row);
  const title = asString(row.title, 120);
  const description = asString(row.description, 600);
  const floatingCards = parseFloatingCards(row.floatingCards);
  const examBadges = parseExamBadges(row.examBadges);
  return {
    isActive: asBool(row.isActive, true),
    eyebrow: legacy ? fallback.eyebrow : asString(row.eyebrow, 48) || fallback.eyebrow,
    badgeLabel: asString(row.badgeLabel, 24) || fallback.badgeLabel,
    title: legacy ? fallback.title : title || fallback.title,
    highlightedTitle: legacy
      ? fallback.highlightedTitle
      : 'highlightedTitle' in row
        ? asString(row.highlightedTitle, 120)
        : fallback.highlightedTitle,
    description: legacy ? fallback.description : description || fallback.description,
    motivationalText: legacy
      ? fallback.motivationalText
      : 'motivationalText' in row
        ? asMultiline(row.motivationalText, 80)
        : fallback.motivationalText,
    primaryButtonText: asString(row.primaryButtonText, 48) || fallback.primaryButtonText,
    primaryButtonLink: asHref(row.primaryButtonLink, fallback.primaryButtonLink),
    secondaryButtonText: legacy ? '' : asString(row.secondaryButtonText, 48),
    secondaryButtonLink: row.secondaryButtonText
      ? asHref(row.secondaryButtonLink, fallback.secondaryButtonLink)
      : asString(row.secondaryButtonLink, 500),
    heroImage: asString(row.heroImage, 800) || fallback.heroImage,
    heroImageAlt: asString(row.heroImageAlt, 160) || fallback.heroImageAlt,
    backgroundImage: asString(row.backgroundImage, 800),
    benefits: legacy || !Array.isArray(row.benefits) ? fallback.benefits : parseBenefits(row.benefits),
    floatingCards:
      !legacy && Array.isArray(row.floatingCards) ? floatingCards : fallback.floatingCards,
    examBadges: !legacy && Array.isArray(row.examBadges) ? examBadges : fallback.examBadges,
  };
}

export function resolveHomeTestSubscription(settingValue: unknown): HomeTestSubscription | null {
  const parsed = parseTestSubscriptionSetting(settingValue);
  if (!parsed) return buildDefaultHomeTestSubscription();
  if (!parsed.isActive) return null;
  return {
    ...parsed,
    benefits: parsed.benefits.filter((item) => item.isActive),
    floatingCards: parsed.floatingCards.filter((item) => item.isActive),
    examBadges: parsed.examBadges.filter((item) => item.isActive),
  };
}

export function sanitizeHomeTestSubscriptionInput(value: unknown): HomeTestSubscription {
  const parsed = parseTestSubscriptionSetting(value) ?? buildDefaultHomeTestSubscription();
  const fallback = buildDefaultHomeTestSubscription();
  if (parsed.isActive) {
    if (!asString(parsed.title, 120)) parsed.title = fallback.title;
    if (!asString(parsed.description, 600)) parsed.description = fallback.description;
    if (!asString(parsed.primaryButtonText, 48)) parsed.primaryButtonText = fallback.primaryButtonText;
    parsed.primaryButtonLink = asHref(parsed.primaryButtonLink, fallback.primaryButtonLink);
  }
  parsed.benefits = parsed.benefits.map((item, index) => ({ ...item, order: index + 1 }));
  parsed.floatingCards = parsed.floatingCards.map((item, index) => ({ ...item, order: index + 1 }));
  parsed.examBadges = parsed.examBadges.map((item, index) => ({ ...item, order: index + 1 }));
  return parsed;
}
