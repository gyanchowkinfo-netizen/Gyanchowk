export interface CourseCardData {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  price: number;
  discountPercent?: number;
  pricingType: string;
  ratingAvg?: number;
  ratingCount?: number;
  enrollmentCount?: number;
  category?: string;
  targetExam?: string;
  language?: string;
  thumbnail?: { url?: string };
  teachers?: Array<{ _id?: string; name?: string; headline?: string }>;
}

export interface BatchCardData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPercent?: number;
  salePrice?: number;
  status: string;
  startDate?: string;
  endDate?: string;
  language?: string;
  targetExam?: string;
  targetClass?: string;
  examCategory?: string;
  exam?: string;
  category?: string;
  maxStudents?: number;
  enrolledCount?: number;
  durationDays?: number | null;
  validityDays?: number;
  ratingAvg?: number;
  ratingCount?: number;
  subjects?: string[];
  thumbnail?: { url?: string };
  course?: { title?: string; slug?: string; _id?: string };
  courseTitle?: string;
  courseSlug?: string;
  teachers?: Array<{ _id?: string; name?: string; headline?: string; avatar?: { url?: string } }>;
  createdAt?: string;
}

export interface BatchFacet {
  name: string;
  count: number;
}

export interface BatchCatalogStats {
  batches: number;
  enrollments: number;
  exams: number;
  open: number;
}

export interface TeacherCardData {
  _id: string;
  name: string;
  headline?: string;
  bio?: string;
  details?: string;
  experience?: string;
  qualifications?: string[];
  avatar?: { url?: string };
  createdAt?: string;
  courseCount?: number;
  enrollmentCount?: number;
  ratingAvg?: number;
  ratingCount?: number;
  subjects?: string[];
  exams?: string[];
  languages?: string[];
  categories?: string[];
}

export interface TeacherFacet {
  name: string;
  count: number;
}

export interface TeacherCatalogStats {
  teachers: number;
  enrollments: number;
  subjects: number;
  ratingAvg: number;
  ratingCount: number;
  courses: number;
}

export interface PublicPlatformStats {
  students: number;
  teachers: number;
  courses: number;
  batches: number;
}

export interface HomeHighlight {
  value: string;
  title: string;
  description: string;
}

export type DiscoveryTone = 'navy' | 'blue' | 'violet' | 'cyan' | 'warm';

export interface HomeDiscoveryPath {
  name: string;
  href: string;
  body: string;
  tone: DiscoveryTone;
  icon?: string;
}

export interface HomePlatformFeature {
  title: string;
  body: string;
  icon: string;
  tone?: DiscoveryTone;
}

export interface HomeFacultyCard {
  slug: string;
  name: string;
  headline: string;
  bio: string;
  details?: string;
  experience?: string;
  subjects: string[];
  qualifications?: string[];
  languages?: string[];
  href: string;
  imageUrl: string;
  courseCount: number;
  enrollmentCount: number;
  ratingAvg: number;
  ratingCount: number;
}

export interface HomeSectionCopy {
  kicker: string;
  title: string;
  subtitle: string;
}

export interface HomeSectionCopyMap {
  discovery: HomeSectionCopy;
  featured: HomeSectionCopy;
  platform: HomeSectionCopy;
  mentorship: HomeSectionCopy;
  faculty: HomeSectionCopy;
}

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

export type TestPrimeVariant = 'blue' | 'navy' | 'warm' | 'gold' | 'cyan';
export type TestPrimePosition = 'top-left' | 'top-right' | 'mid-left' | 'mid-right' | 'bottom-left' | 'bottom-right';

export interface TestSubscriptionBenefit {
  id: string;
  value: string;
  title: string;
  description: string;
  icon: TestSubscriptionIcon;
  variant: TestPrimeVariant;
  order: number;
  isActive: boolean;
}

export interface TestPrimeFloatingCard {
  id: string;
  icon: TestSubscriptionIcon;
  title: string;
  description: string;
  position: TestPrimePosition;
  order: number;
  isActive: boolean;
}

export interface TestPrimeExamBadge {
  id: string;
  name: string;
  icon: TestSubscriptionIcon;
  variant: TestPrimeVariant;
  position: TestPrimePosition;
  order: number;
  isActive: boolean;
}

export interface HomeTestSubscription {
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
}

export interface CmsPage {
  key: string;
  title?: string;
  body?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ContentCover {
  publicId?: string;
  url?: string;
}

export interface CareerArticle {
  _id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  cover?: ContentCover;
  category?: string;
  featured?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface CareerCategory {
  name: string;
  count: number;
}

export interface CareerRoadmap {
  _id?: string;
  title: string;
  slug: string;
  description?: string;
  steps?: Array<{ title: string; body?: string; order?: number }>;
}

export interface BlogAuthor {
  _id?: string;
  name?: string;
}

export interface BlogPost {
  _id?: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  cover?: ContentCover;
  author?: BlogAuthor | string;
  tags?: string[];
  featured?: boolean;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface BlogTag {
  name: string;
  count: number;
}
