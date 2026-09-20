import type {
  HomeTestSubscription,
  TestPrimeExamBadge,
  TestPrimeFloatingCard,
  TestPrimePosition,
  TestPrimeVariant,
  TestSubscriptionBenefit,
  TestSubscriptionIcon,
} from '@/lib/types';

export const TEST_PRIME_VARIANT_OPTIONS: Array<{ value: TestPrimeVariant; label: string }> = [
  { value: 'blue', label: 'Academic blue' },
  { value: 'navy', label: 'Deep navy' },
  { value: 'warm', label: 'Warm mint' },
  { value: 'gold', label: 'Olive gold' },
  { value: 'cyan', label: 'Soft teal' },
];

export const TEST_PRIME_POSITION_OPTIONS: Array<{ value: TestPrimePosition; label: string }> = [
  { value: 'top-left', label: 'Top left' },
  { value: 'top-right', label: 'Top right' },
  { value: 'mid-left', label: 'Middle left' },
  { value: 'mid-right', label: 'Middle right' },
  { value: 'bottom-left', label: 'Bottom left' },
  { value: 'bottom-right', label: 'Bottom right' },
];

const ICONS = new Set<string>([
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
]);
const VARIANTS = new Set<string>(['blue', 'navy', 'warm', 'gold', 'cyan']);
const POSITIONS = new Set<string>([
  'top-left',
  'top-right',
  'mid-left',
  'mid-right',
  'bottom-left',
  'bottom-right',
]);

export const DEFAULT_HOME_TEST_SUBSCRIPTION: HomeTestSubscription = {
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
      description: 'See your improvement with detailed reports',
      position: 'top-right',
      order: 1,
      isActive: true,
    },
    {
      id: 'pattern',
      icon: 'Target',
      title: 'Real Exam Pattern',
      description: 'Practice like the real exam',
      position: 'mid-left',
      order: 2,
      isActive: true,
    },
  ],
  examBadges: [
    { id: 'upsc', name: 'UPSC', icon: 'GraduationCap', variant: 'navy', position: 'bottom-left', order: 1, isActive: true },
    { id: 'ssc', name: 'SSC', icon: 'Files', variant: 'cyan', position: 'bottom-left', order: 2, isActive: true },
    { id: 'banking', name: 'Banking', icon: 'Landmark', variant: 'gold', position: 'bottom-right', order: 3, isActive: true },
    { id: 'railways', name: 'Railways', icon: 'TrainFront', variant: 'blue', position: 'bottom-right', order: 4, isActive: true },
  ],
};

function asString(value: unknown, max = 400) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
}

function asMultiline(value: unknown, max = 80) {
  return typeof value === 'string' ? value.replace(/\r\n/g, '\n').trim().slice(0, max) : '';
}

function asIcon(value: unknown, fallback: TestSubscriptionIcon): TestSubscriptionIcon {
  const icon = asString(value, 48);
  return ICONS.has(icon) ? (icon as TestSubscriptionIcon) : fallback;
}

function asVariant(value: unknown, fallback: TestPrimeVariant): TestPrimeVariant {
  const variant = asString(value, 16);
  return VARIANTS.has(variant) ? (variant as TestPrimeVariant) : fallback;
}

function asPosition(value: unknown, fallback: TestPrimePosition): TestPrimePosition {
  const position = asString(value, 24);
  return POSITIONS.has(position) ? (position as TestPrimePosition) : fallback;
}

function asBool(value: unknown, fallback = true) {
  return typeof value === 'boolean' ? value : fallback;
}

function isLegacyLedger(value: Record<string, unknown>) {
  const title = typeof value.title === 'string' ? value.title.toLowerCase().replace(/\.$/, '').trim() : '';
  return title === 'one learning pass' || value.visualMode === 'ledger' || value.panelTitle === 'Your exam intelligence';
}

export function hydrateHomeTestSubscription(value: unknown): HomeTestSubscription {
  const fallback = DEFAULT_HOME_TEST_SUBSCRIPTION;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;
  const row = value as Record<string, unknown>;
  if (isLegacyLedger(row)) {
    return {
      ...fallback,
      isActive: asBool(row.isActive, true),
      primaryButtonText: asString(row.primaryButtonText, 48) || fallback.primaryButtonText,
      primaryButtonLink: asString(row.primaryButtonLink, 500) || fallback.primaryButtonLink,
      heroImage: asString(row.heroImage, 800) || fallback.heroImage,
      heroImageAlt: asString(row.heroImageAlt, 160) || fallback.heroImageAlt,
    };
  }
  const benefits: TestSubscriptionBenefit[] = Array.isArray(row.benefits)
    ? row.benefits.flatMap((item, index): TestSubscriptionBenefit[] => {
        if (!item || typeof item !== 'object') return [];
        const rec = item as Record<string, unknown>;
        const title = asString(rec.title, 80);
        const description = asString(rec.description, 240);
        if (!title && !description && !asString(rec.value, 24)) return [];
        return [
          {
            id: asString(rec.id, 64) || `benefit-${index + 1}`,
            value: asString(rec.value, 24),
            title,
            description,
            icon: asIcon(rec.icon, 'ClipboardCheck'),
            variant: asVariant(rec.variant, fallback.benefits[index % fallback.benefits.length]?.variant ?? 'blue'),
            order: Number.isFinite(Number(rec.order)) ? Number(rec.order) : index + 1,
            isActive: asBool(rec.isActive, rec.active !== false),
          },
        ];
      })
    : fallback.benefits;

  const floatingSource = Array.isArray(row.floatingCards) && row.floatingCards.length ? row.floatingCards : row.features;
  const floatingCards: TestPrimeFloatingCard[] = Array.isArray(floatingSource)
    ? floatingSource.flatMap((item, index): TestPrimeFloatingCard[] => {
        if (!item || typeof item !== 'object') return [];
        const rec = item as Record<string, unknown>;
        const title = asString(rec.title ?? rec.label, 80);
        if (!title) return [];
        const positions: TestPrimePosition[] = ['top-right', 'mid-left', 'bottom-left', 'bottom-right'];
        return [
          {
            id: asString(rec.id, 64) || `float-${index + 1}`,
            icon: asIcon(rec.icon, 'ChartNoAxesCombined'),
            title,
            description: asString(rec.description ?? rec.value, 160),
            position: asPosition(rec.position, positions[index % positions.length] ?? 'top-right'),
            order: Number.isFinite(Number(rec.order)) ? Number(rec.order) : index + 1,
            isActive: asBool(rec.isActive, rec.active !== false),
          },
        ];
      })
    : fallback.floatingCards;

  const examBadges: TestPrimeExamBadge[] = Array.isArray(row.examBadges)
    ? row.examBadges.flatMap((item, index): TestPrimeExamBadge[] => {
        if (!item || typeof item !== 'object') return [];
        const rec = item as Record<string, unknown>;
        const name = asString(rec.name ?? rec.title, 40);
        if (!name) return [];
        const positions: TestPrimePosition[] = ['bottom-left', 'bottom-left', 'bottom-right', 'bottom-right'];
        const variants: TestPrimeVariant[] = ['navy', 'cyan', 'gold', 'blue'];
        return [
          {
            id: asString(rec.id, 64) || `badge-${index + 1}`,
            name,
            icon: asIcon(rec.icon, 'GraduationCap'),
            variant: asVariant(rec.variant, variants[index % variants.length] ?? 'navy'),
            position: asPosition(rec.position, positions[index % positions.length] ?? 'bottom-right'),
            order: Number.isFinite(Number(rec.order)) ? Number(rec.order) : index + 1,
            isActive: asBool(rec.isActive, rec.active !== false),
          },
        ];
      })
    : fallback.examBadges;

  return {
    isActive: asBool(row.isActive, true),
    eyebrow: asString(row.eyebrow, 48) || fallback.eyebrow,
    badgeLabel: asString(row.badgeLabel, 24) || fallback.badgeLabel,
    title: asString(row.title, 120) || fallback.title,
    highlightedTitle: asString(row.highlightedTitle, 120),
    description: asString(row.description, 600) || fallback.description,
    motivationalText: asMultiline(row.motivationalText, 80),
    primaryButtonText: asString(row.primaryButtonText, 48) || fallback.primaryButtonText,
    primaryButtonLink: asString(row.primaryButtonLink, 500) || fallback.primaryButtonLink,
    secondaryButtonText: asString(row.secondaryButtonText, 48),
    secondaryButtonLink: asString(row.secondaryButtonLink, 500),
    heroImage: asString(row.heroImage, 800) || fallback.heroImage,
    heroImageAlt: asString(row.heroImageAlt, 160) || fallback.heroImageAlt,
    backgroundImage: asString(row.backgroundImage, 800),
    benefits: benefits.length ? benefits : fallback.benefits,
    floatingCards: floatingCards.length ? floatingCards : fallback.floatingCards,
    examBadges: examBadges.length ? examBadges : fallback.examBadges,
  };
}
