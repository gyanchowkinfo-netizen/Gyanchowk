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
  foundation?: string;
  startsOn?: string;
  featured?: boolean;
  createdAt?: string;
  publishedAt?: string;
  thumbnail?: { url?: string };
  teachers?: Array<{ _id?: string; name?: string; headline?: string; avatar?: { url?: string }; bio?: string; qualification?: string; experience?: string; expertise?: string[] | string }>;
  teacherName?: string;
}

export interface CourseHighlight {
  icon?: string;
  title: string;
  subtitle?: string;
}

export interface CourseStatistic {
  label: string;
  value: string;
  icon?: string;
}

export interface CourseFeature {
  icon?: string;
  title: string;
  description: string;
}

export interface CourseIncludeItem {
  icon?: string;
  title: string;
  subtitle?: string;
}

export interface CourseCurriculumModule {
  moduleTitle: string;
  moduleSubtitle?: string;
  topics: string[];
}

export interface CourseBannerItem {
  publicId?: string;
  url: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  active?: boolean;
  order?: number;
}

export interface CourseInstructorInfo {
  name?: string;
  role?: string;
  qualification?: string;
  experience?: string;
  expertise?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface CourseFinalCta {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  enabled?: boolean;
}

export interface CourseSectionVisibility {
  overview?: boolean;
  whatYouLearn?: boolean;
  features?: boolean;
  includes?: boolean;
  syllabus?: boolean;
  instructors?: boolean;
  faqs?: boolean;
  finalCta?: boolean;
}

export interface CourseDetail extends CourseCardData {
  description?: string;
  validityDays?: number;
  outcomes?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  certificateEnabled?: boolean;
  badge?: string;
  duration?: string;
  level?: string;
  comparePrice?: number;
  banner?: { publicId?: string; url?: string };
  banners?: CourseBannerItem[];
  highlights?: CourseHighlight[];
  statistics?: CourseStatistic[];
  features?: CourseFeature[];
  includes?: CourseIncludeItem[];
  curriculum?: CourseCurriculumModule[];
  instructorInfo?: CourseInstructorInfo;
  finalCta?: CourseFinalCta;
  sectionVisibility?: CourseSectionVisibility;
  sectionOrder?: string[];
  demoVideo?: { publicId?: string; url?: string };
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
  slug?: string;
  headline?: string;
  designation?: string;
  subject?: string;
  specialization?: string;
  bio?: string;
  tagline?: string;
  teachingMethodology?: string;
  details?: string;
  experience?: string;
  education?: string;
  location?: string;
  qualifications?: string[];
  certifications?: string[];
  languages?: string[];
  avatar?: { url?: string; publicId?: string };
  profileImage?: { url?: string; publicId?: string };
  coverImage?: { url?: string; publicId?: string };
  socialLinks?: {
    linkedin?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
    website?: string;
  };
  stats?: {
    courseCount?: number;
    enrollmentCount?: number;
    reviewCount?: number;
    rating?: number;
  };
  featured?: boolean;
  status?: string;
  displayOrder?: number;
  quote?: {
    text?: string;
    author?: string;
    designation?: string;
    bgImage?: string;
    icon?: string;
    visible?: boolean;
  };
  doubtCTA?: {
    title?: string;
    description?: string;
    buttonText?: string;
    buttonUrl?: string;
    visible?: boolean;
  };
  achievements?: Array<{
    title: string;
    value?: string;
    label?: string;
    icon?: string;
    description?: string;
    image?: string;
    displayOrder?: number;
  }>;
  reviews?: Array<{
    _id?: string;
    id?: string;
    studentName: string;
    studentAvatar?: string;
    roleOrExam?: string;
    targetExam?: string;
    rating: number;
    comment: string;
    reviewText?: string;
    date?: string;
    approved?: boolean;
    featured?: boolean;
    status?: string;
  }>;
  customCourses?: Array<{
    title: string;
    subject?: string;
    modulesCount?: number;
    durationHours?: number;
    rating?: number;
    price?: number;
    url?: string;
    thumbnail?: string;
  }>;
  benefits?: Array<{
    title: string;
    subtitle?: string;
    icon?: string;
  }>;
  seo?: {
    title?: string;
    description?: string;
  };
  createdAt?: string;
  courseCount?: number;
  enrollmentCount?: number;
  ratingAvg?: number;
  ratingCount?: number;
  subjects?: string[];
  exams?: string[];
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
export type HomeCardAccent = 'blue' | 'lavender' | 'cyan' | 'mint' | 'peach' | 'pink';

export interface HomeDiscoveryPath {
  name: string;
  href: string;
  body: string;
  tone: DiscoveryTone;
  icon?: string;
  imageUrl?: string;
  ctaText?: string;
  accent?: HomeCardAccent;
  order?: number;
}

export interface HomePlatformFeature {
  title: string;
  body: string;
  icon: string;
  tone?: DiscoveryTone;
  imageUrl?: string;
  href?: string;
  ctaText?: string;
  accent?: HomeCardAccent;
  order?: number;
}

export interface HomeWhyCard {
  title: string;
  body: string;
  imageUrl?: string;
  href?: string;
  ctaText?: string;
  accent?: HomeCardAccent;
  tone?: DiscoveryTone;
  order?: number;
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

export interface CoursesHeroStat {
  _key: string;
  value: string;
  label: string;
  icon?: string;
  active?: boolean;
}

export interface CoursesHeroFloatingCard {
  _key: string;
  title: string;
  subtitle: string;
  icon?: string;
  position?: 'top-right' | 'bottom-left' | 'top-left' | 'bottom-right';
  active?: boolean;
}

export interface CoursesHeroConfig {
  badge: string;
  title: string;
  titleHighlight: string;
  subtitle: string;
  searchPlaceholder: string;
  searchButtonText: string;
  imageUrl: string;
  imageAlt: string;
  stats: CoursesHeroStat[];
  floatingCards: CoursesHeroFloatingCard[];
}

export interface CoursesPromoBenefit {
  _key: string;
  title: string;
  subtitle: string;
  icon?: string;
  active?: boolean;
}

export interface CoursesFeaturedPromoConfig {
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink?: string;
  imageUrl: string;
  imageAlt: string;
  benefits: CoursesPromoBenefit[];
}

export interface CoursesPageConfig {
  hero: CoursesHeroConfig;
  featuredPromo: CoursesFeaturedPromoConfig;
}

export const DEFAULT_COURSES_PAGE_CONFIG: CoursesPageConfig = {
  hero: {
    badge: 'LEARN ANYTIME, ANYWHERE',
    title: 'Courses built for',
    titleHighlight: 'deep work',
    subtitle:
      'Recorded syllabi, verified enrollment, and tests that rank on the server — browse everything the team has published.',
    searchPlaceholder: 'Search by title, exam or subject',
    searchButtonText: 'Search',
    imageUrl: '/courses-hero-student.jpg',
    imageAlt: 'Student learning online',
    stats: [
      { _key: 's1', value: '100+', label: 'Expert Instructors', icon: 'instructor', active: true },
      { _key: 's2', value: '20K+', label: 'Active Learners', icon: 'students', active: true },
      { _key: 's3', value: '95%', label: 'Satisfaction Rate', icon: 'rate', active: true },
    ],
    floatingCards: [
      {
        _key: 'fc1',
        title: 'Learn at your pace',
        subtitle: 'Video lessons, notes & quizzes',
        icon: 'play',
        position: 'top-right',
        active: true,
      },
      {
        _key: 'fc2',
        title: 'Certificate on completion',
        subtitle: 'Showcase your skills',
        icon: 'check',
        position: 'bottom-left',
        active: true,
      },
    ],
  },
  featuredPromo: {
    badge: 'FEATURED',
    title: 'Boost Your Career with the Right Skills',
    subtitle:
      'Explore top-rated courses, get certified, and unlock new career opportunities.',
    ctaText: 'Explore Featured Courses',
    ctaLink: '',
    imageUrl: '/courses-featured-cap.jpg',
    imageAlt: 'Graduation Cap and Books',
    benefits: [
      {
        _key: 'b1',
        title: 'Flexible Learning',
        subtitle: 'Learn on your schedule',
        icon: 'laptop',
        active: true,
      },
      {
        _key: 'b2',
        title: 'Verified Certificates',
        subtitle: 'Build your portfolio',
        icon: 'award',
        active: true,
      },
      {
        _key: 'b3',
        title: 'Lifetime Access',
        subtitle: 'Revisit anytime',
        icon: 'rotate',
        active: true,
      },
    ],
  },
};

export interface TeachersHeroBadge {
  _key: string;
  icon: 'faculty' | 'verified' | 'teachers' | 'award' | 'star' | 'book';
  text: string;
  active: boolean;
}

export interface TeachersHeroStat {
  _key: string;
  value: string;
  label: string;
  icon: 'instructor' | 'students' | 'rate' | 'star' | 'book';
  active: boolean;
}

export interface TeachersHeroFloatingCard {
  _key: string;
  title: string;
  subtitle: string;
  icon: 'play' | 'check' | 'award' | 'star';
  position: 'top-right' | 'bottom-left' | 'top-left' | 'bottom-right';
  active: boolean;
}

export interface TeachersHeroConfig {
  status: 'published' | 'draft';
  active: boolean;
  eyebrow: string;
  heading: string;
  headingHighlight: string;
  description: string;
  searchPlaceholder: string;
  searchButtonText: string;
  browseAllText: string;
  browseAllLink: string;
  becomeTeacherText: string;
  becomeTeacherLink: string;
  imageUrl: string;
  imageAlt: string;
  imagePosition?: 'right' | 'left';
  decorativeBadgeText?: string;
  decorativeBadgeActive?: boolean;
  badges: TeachersHeroBadge[];
  stats?: TeachersHeroStat[];
  floatingCards?: TeachersHeroFloatingCard[];
}

export interface TeachersWhyCard {
  _key: string;
  icon: 'educator' | 'target' | 'book' | 'doubt' | 'chart' | 'mentor' | 'shield' | 'award' | 'laptop';
  title: string;
  description: string;
  badge?: string;
  link?: string;
  order: number;
  active: boolean;
}

export interface TeachersWhyConfig {
  status: 'published' | 'draft';
  active: boolean;
  eyebrow?: string;
  heading: string;
  headingHighlight: string;
  description: string;
  cards: TeachersWhyCard[];
}

export interface TeachersBecomeCTAConfig {
  status: 'published' | 'draft';
  active: boolean;
  eyebrow: string;
  heading: string;
  headingHighlight: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  buttonActive: boolean;
  backgroundImageUrl?: string;
}

export interface TeachersPageConfig {
  hero: TeachersHeroConfig;
  whyLearn: TeachersWhyConfig;
  becomeTeacher: TeachersBecomeCTAConfig;
  publishedAt?: string;
  updatedAt?: string;
}

export const DEFAULT_TEACHERS_PAGE_CONFIG: TeachersPageConfig = {
  hero: {
    status: 'published',
    active: true,
    eyebrow: 'YOUR LEARNING PARTNER',
    heading: 'Learn from expert teachers',
    headingHighlight: 'expert',
    description:
      'Discover approved educators teaching recorded courses, batches and exam preparation — without live-class noise.',
    searchPlaceholder: 'Search by name, headline or subject',
    searchButtonText: 'Search',
    browseAllText: 'Browse all',
    browseAllLink: '#all-teachers',
    becomeTeacherText: 'Become a teacher →',
    becomeTeacherLink: '/register?role=teacher',
    imageUrl: '/teachers-hero-faculty.png',
    imageAlt: 'Expert Gyan Chowk Faculty',
    imagePosition: 'right',
    decorativeBadgeText: 'Better Learning, Brighter Future',
    decorativeBadgeActive: true,
    badges: [
      { _key: 'b1', icon: 'faculty', text: 'Expert Faculty', active: true },
      { _key: 'b2', icon: 'verified', text: 'Verified Faculty', active: true },
      { _key: 'b3', icon: 'teachers', text: '2+ Teachers', active: true },
    ],
    stats: [
      { _key: 's1', value: '100+', label: 'Approved Educators', icon: 'instructor', active: true },
      { _key: 's2', value: 'Verified', label: 'Faculty & Mentors', icon: 'rate', active: true },
      { _key: 's3', value: '4.8/5', label: 'Average Rating', icon: 'star', active: true },
    ],
    floatingCards: [
      {
        _key: 'fc1',
        title: 'Expert Faculty',
        subtitle: 'Admin-approved educators',
        icon: 'award',
        position: 'top-right',
        active: true,
      },
      {
        _key: 'fc2',
        title: 'Structured Guidance',
        subtitle: 'Recorded paths & async doubts',
        icon: 'check',
        position: 'bottom-left',
        active: true,
      },
    ],
  },
  whyLearn: {
    status: 'published',
    active: true,
    eyebrow: '',
    heading: 'Why learn from Gyan Chowk teachers',
    headingHighlight: 'teachers',
    description:
      'Our teachers are more than just educators — they are mentors, guides and subject experts who help you achieve your goals.',
    cards: [
      {
        _key: 'w1',
        icon: 'educator',
        title: 'Expert educators',
        description: 'Only admin-approved teachers appear in this catalogue. Private emails and payouts stay hidden.',
        order: 1,
        active: true,
      },
      {
        _key: 'w2',
        icon: 'target',
        title: 'Exam-focused teaching',
        description: 'Faculty publish recorded paths for JEE, NEET, boards, government exams and career skills.',
        order: 2,
        active: true,
      },
      {
        _key: 'w3',
        icon: 'book',
        title: 'Structured learning',
        description: 'Courses, batches, syllabus and study materials sit behind verified enrollment — not live-class FOMO.',
        order: 3,
        active: true,
      },
      {
        _key: 'w4',
        icon: 'doubt',
        title: 'Aspire doubt desk',
        description: 'Students raise doubts with images. Teachers answer on the record, without a live chat classroom.',
        order: 4,
        active: true,
      },
      {
        _key: 'w5',
        icon: 'chart',
        title: 'Performance tracking',
        description: 'Tests, ranks and certificates are computed on the server after real attempts.',
        order: 5,
        active: true,
      },
      {
        _key: 'w6',
        icon: 'mentor',
        title: 'Mentorship reviews',
        description: 'Goals and scheduled reviews exist as mentorship — never as live streaming.',
        order: 6,
        active: true,
      },
    ],
  },
  becomeTeacher: {
    status: 'published',
    active: true,
    eyebrow: 'SHARE YOUR KNOWLEDGE',
    heading: 'Become a Gyan Chowk teacher',
    headingHighlight: 'teacher',
    description:
      'Teach with recorded lessons, tests and study materials. Applications need admin approval — there is no public admin signup.',
    buttonText: 'Become a teacher →',
    buttonUrl: '/register?role=teacher',
    buttonActive: true,
  },
};

export interface AboutHeroConfig {
  eyebrow: string;
  heading: string;
  headingHighlight?: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  imageUrl: string;
  imageAlt?: string;
  badgeText?: string;
  badges: Array<{ _key: string; text: string; icon?: string; active?: boolean }>;
  stats: Array<{ _key: string; label: string; value: string; active?: boolean }>;
}

export interface AboutMissionConfig {
  eyebrow: string;
  heading: string;
  headingHighlight?: string;
  body: string;
  quote?: string;
  quoteAuthor?: string;
  imageUrl: string;
  imageAlt?: string;
  badgePills: Array<{ _key: string; title: string; subtitle?: string; icon?: string; active?: boolean }>;
}

export interface AboutVisionConfig {
  eyebrow: string;
  heading: string;
  headingHighlight?: string;
  description: string;
  stages: Array<{ _key: string; title: string; body: string; icon?: string; active?: boolean; order?: number }>;
}

export type WhyAccent =
  | 'amber'
  | 'violet'
  | 'green'
  | 'coral'
  | 'orange'
  | 'blue'
  | 'indigo'
  | 'teal'
  | 'pink'
  | 'rose'
  | 'cyan';

export interface AboutWhyItem {
  _key: string;
  title: string;
  body: string;
  accent?: WhyAccent | string;
  order?: number;
  active?: boolean;
  tag?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AboutWhyConfig {
  eyebrow: string;
  heading: string;
  headingHighlight?: string;
  description?: string;
  items: AboutWhyItem[];
}

export interface AboutEcosystemConfig {
  eyebrow: string;
  heading: string;
  headingHighlight?: string;
  description?: string;
  hubTitle: string;
  hubSubtitle: string;
  nodes: Array<{ _key: string; name: string; href: string; icon?: string; badge?: string; active?: boolean }>;
}

export interface AboutValuesConfig {
  eyebrow: string;
  heading: string;
  headingHighlight?: string;
  description?: string;
  items: Array<{ _key: string; title: string; body: string; icon?: string; colorVariant?: string; active?: boolean }>;
}

export interface AboutPlatformConfig {
  eyebrow: string;
  heading: string;
  headingHighlight?: string;
  description?: string;
  items: Array<{ _key: string; title: string; body: string; href: string; icon?: string; badge?: string; active?: boolean }>;
}

export interface AboutImpactConfig {
  eyebrow: string;
  heading: string;
  headingHighlight?: string;
  description: string;
  note?: string;
  customStats?: Array<{ _key: string; label: string; value: string; active?: boolean }>;
}

export interface AboutFutureVisionConfig {
  eyebrow: string;
  heading: string;
  headingHighlight?: string;
  description: string;
  imageUrl?: string;
  steps: Array<{ _key: string; title: string; body: string; tag?: string; active?: boolean }>;
}

export interface AboutCTAConfig {
  eyebrow: string;
  heading: string;
  headingHighlight?: string;
  description: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
  bannerImageUrl?: string;
  badges: Array<{ _key: string; text: string; icon?: string; active?: boolean }>;
}

export interface AboutPageConfig {
  hero: AboutHeroConfig;
  mission: AboutMissionConfig;
  vision: AboutVisionConfig;
  whyGyanChowk: AboutWhyConfig;
  learningEcosystem: AboutEcosystemConfig;
  values: AboutValuesConfig;
  platformFeatures: AboutPlatformConfig;
  impact: AboutImpactConfig;
  futureVision: AboutFutureVisionConfig;
  cta: AboutCTAConfig;
  publishedAt?: string;
  updatedAt?: string;
}

export const DEFAULT_ABOUT_PAGE_CONFIG: AboutPageConfig = {
  hero: {
    eyebrow: 'ABOUT GYAN CHOWK',
    heading: 'Learning Should Have No Limits.',
    headingHighlight: 'No Limits.',
    description:
      'Gyan Chowk is building a structured, outcome-driven learning ecosystem that helps students learn, practice, improve and move toward their highest goals through recorded courses, batches, tests, doubts and career guidance.',
    primaryCtaText: 'Explore Gyan Chowk',
    primaryCtaLink: '#why',
    secondaryCtaText: 'Explore Courses',
    secondaryCtaLink: '/courses',
    imageUrl: '/about-hero-students.jpg',
    imageAlt: 'Gyan Chowk Students Learning',
    badgeText: '',
    badges: [
      { _key: 'ab-b1', text: 'Recorded HLS Video', icon: 'video', active: true },
      { _key: 'ab-b2', text: 'Verified Faculty', icon: 'award', active: true },
      { _key: 'ab-b3', text: 'Zero Live Noise', icon: 'shield', active: true },
    ],
    stats: [
      { _key: 'ab-s1', label: 'Structured Courses', value: '100+', active: true },
      { _key: 'ab-s2', label: 'Average Rating', value: '4.9 ★', active: true },
      { _key: 'ab-s3', label: 'Verified Curricula', value: '100%', active: true },
    ],
  },
  mission: {
    eyebrow: 'OUR MISSION',
    heading: 'Give every student a clear path from first lesson to next opportunity.',
    headingHighlight: 'clear path',
    body: 'Gyan Chowk helps students learn, practice, improve and move toward their goals through recorded courses, batches, tests, doubts and career guidance.\n\nWe strip away live classroom distractions to deliver verified curricula, recorded by expert educators and supported by instant async doubt resolution.',
    quote: 'Education should never be gated by geography or circumstance. Structured, verified knowledge changes lives.',
    quoteAuthor: 'The Gyan Chowk Creed',
    imageUrl: '/about-mission-studio.jpg',
    imageAlt: 'Modern Learning Studio',
    badgePills: [],
  },
  vision: {
    eyebrow: 'OUR VISION',
    heading: 'Learning, practice and progress in one place.',
    headingHighlight: 'progress',
    description:
      'We are building an ecosystem where courses, batches, teachers, tests and career maps work together — so students improve with evidence, not guesswork.',
    stages: [
      { _key: 'v1', title: 'Student', body: 'Every journey starts with an ambitious learner and a target goal.', icon: 'flag', active: true, order: 1 },
      { _key: 'v2', title: 'Learning', body: 'Recorded lessons, downloadable notes and structured batch cohorts.', icon: 'book', active: true, order: 2 },
      { _key: 'v3', title: 'Skills', body: 'Deliberate practice through timed tests, assignments and async doubts.', icon: 'target', active: true, order: 3 },
      { _key: 'v4', title: 'Confidence', body: 'Deep analytics, percentiles and rank insights based on real submissions.', icon: 'sparkles', active: true, order: 4 },
      { _key: 'v5', title: 'Opportunity', body: 'Verified completion certificates, career roadmaps and the leap forward.', icon: 'award', active: true, order: 5 },
    ],
  },
  whyGyanChowk: {
    eyebrow: 'WHY GYAN CHOWK',
    heading: 'A complete recorded learning stack',
    headingHighlight: 'recorded learning stack',
    description:
      'Everything is built from the ground up for serious learners who value clarity and proof of progress.',
    items: [
      {
        _key: 'w1',
        title: 'Recorded Video Learning',
        body: 'HLS lessons you can pause, resume and revisit on your own time.',
        accent: 'amber',
        order: 1,
        active: true,
      },
      {
        _key: 'w2',
        title: 'Structured Batches',
        body: 'Cohorts with a syllabus, schedule and faculty guidance.',
        accent: 'violet',
        order: 2,
        active: true,
      },
      {
        _key: 'w3',
        title: 'Study Materials',
        body: 'Notes and PDFs unlocked after verified enrollment.',
        accent: 'green',
        order: 3,
        active: true,
      },
      {
        _key: 'w4',
        title: 'Tests',
        body: 'Timed papers, negative marking and all-India ranks.',
        accent: 'coral',
        order: 4,
        active: true,
      },
      {
        _key: 'w5',
        title: 'Assignments',
        body: 'Published work evaluated rigorously on the server.',
        accent: 'orange',
        order: 5,
        active: true,
      },
      {
        _key: 'w6',
        title: 'Doubt Resolution',
        body: 'Async doubt engine with direct faculty replies.',
        accent: 'blue',
        order: 6,
        active: true,
      },
      {
        _key: 'w7',
        title: 'Mentorship',
        body: 'Guided reviews with faculty on a recorded learning cadence.',
        accent: 'indigo',
        order: 7,
        active: true,
      },
      {
        _key: 'w8',
        title: 'Analytics',
        body: 'Progress from actual watch and attempt data.',
        accent: 'teal',
        order: 8,
        active: true,
      },
      {
        _key: 'w9',
        title: 'Rankings',
        body: 'Leaderboards from submitted tests, not estimates.',
        accent: 'pink',
        order: 9,
        active: true,
      },
      {
        _key: 'w10',
        title: 'Certificates',
        body: 'Issued from completion rules you can verify publicly.',
        accent: 'indigo',
        order: 10,
        active: true,
      },
      {
        _key: 'w11',
        title: 'Career Resources',
        body: 'Roadmaps and articles from the career desk.',
        accent: 'teal',
        order: 11,
        active: true,
      },
    ],
  },
  learningEcosystem: {
    eyebrow: 'LEARNING ECOSYSTEM',
    heading: 'One hub. Connected learning.',
    headingHighlight: 'Connected learning',
    description: 'Every pillar of education connects seamlessly inside Gyan Chowk to keep your momentum high.',
    hubTitle: '',
    hubSubtitle: '',
    nodes: [
      { _key: 'e1', name: 'Courses', href: '/courses', icon: 'book', badge: 'Core', active: true },
      { _key: 'e2', name: 'Teachers', href: '/teachers', icon: 'users', badge: 'Expert', active: true },
      { _key: 'e3', name: 'Students', href: '/register', icon: 'user', badge: 'Active', active: true },
      { _key: 'e4', name: 'Study materials', href: '/courses', icon: 'file', badge: 'PDF', active: true },
      { _key: 'e5', name: 'Tests', href: '/courses', icon: 'clipboard', badge: 'Timed', active: true },
      { _key: 'e6', name: 'Assignments', href: '/courses', icon: 'target', badge: 'Evaluated', active: true },
      { _key: 'e7', name: 'Doubts', href: '/about#why', icon: 'help', badge: 'Async', active: true },
      { _key: 'e8', name: 'Analytics', href: '/about#why', icon: 'barChart', badge: 'Live', active: true },
      { _key: 'e9', name: 'Career Desk', href: '/career', icon: 'compass', badge: 'Roadmaps', active: true },
      { _key: 'e10', name: 'Mentorship', href: '/teachers', icon: 'userCheck', badge: '1-on-1', active: true },
    ],
  },
  values: {
    eyebrow: 'OUR VALUES',
    heading: 'What we refuse to compromise',
    headingHighlight: 'refuse to compromise',
    description: 'Our core operating principles and unwavering commitments to every learner and educator.',
    items: [
      { _key: 'va1', icon: 'users', title: 'Student first', body: 'Product decisions start with learner outcomes, not vanity metrics.', colorVariant: 'blue', active: true },
      { _key: 'va2', icon: 'sparkles', title: 'Quality learning', body: 'Recorded lessons, tests and materials stay enrollment-gated and verified.', colorVariant: 'amber', active: true },
      { _key: 'va3', icon: 'heart', title: 'Accessibility', body: 'Learn on your schedule, with recorded lessons you can pause and resume anywhere.', colorVariant: 'rose', active: true },
      { _key: 'va4', icon: 'target', title: 'Consistency', body: 'Batches, attendance tracking and backlog planning keep effort visible.', colorVariant: 'emerald', active: true },
      { _key: 'va5', icon: 'lightbulb', title: 'Innovation', body: 'Analytics, ranks and doubts improve how students actually retain knowledge.', colorVariant: 'purple', active: true },
      { _key: 'va6', icon: 'shield', title: 'Trust & Integrity', body: 'Payments, certificates and course access are decided securely on the server.', colorVariant: 'cyan', active: true },
      { _key: 'va7', icon: 'trendingUp', title: 'Performance', body: 'Every page loads lightning fast. UI motion never blocks your study session.', colorVariant: 'indigo', active: true },
      { _key: 'va8', icon: 'loop', title: 'Continuous Growth', body: 'CMS, faculty updates and learner feedback keep the ecosystem honest and growing.', colorVariant: 'teal', active: true },
    ],
  },
  platformFeatures: {
    eyebrow: 'PLATFORM FEATURES',
    heading: 'Everything students need to learn better',
    headingHighlight: 'learn better',
    description: 'Tools, technology and workflows designed to turn daily effort into genuine subject mastery.',
    items: [
      { _key: 'pf1', icon: 'book', title: 'Courses', href: '/courses', body: 'Recorded syllabi with verified enrollment and lesson progress.', badge: '', active: true },
      { _key: 'pf2', icon: 'video', title: 'HLS Video Learning', href: '/courses', body: 'Adaptive bitrate playback with seamless resume from where you stopped.', badge: 'Fast HLS', active: true },
      { _key: 'pf3', icon: 'clipboard', title: 'Tests & Mock Exams', href: '/courses', body: 'Timed papers with percentile scores and ranks from real attempts.', badge: 'Real Ranks', active: true },
      { _key: 'pf4', icon: 'file', title: 'Graded Assignments', href: '/courses', body: 'Published coursework with server-side review and progress checkpoints.', badge: 'Feedback', active: true },
      { _key: 'pf5', icon: 'book', title: 'Study Materials', href: '/courses', body: 'Chapter notes and formulas unlocked securely after enrollment.', badge: 'Curated', active: true },
      { _key: 'pf6', icon: 'help', title: 'Async Doubt Engine', href: '/about#why', body: 'Post questions with image attachments and get direct teacher responses.', badge: 'Priority', active: true },
      { _key: 'pf7', icon: 'userCheck', title: 'Faculty Mentorship', href: '/teachers', body: 'Scheduled guidance and reviews through the mentorship desk.', badge: 'Direct', active: true },
      { _key: 'pf8', icon: 'barChart', title: 'Activity Analytics', href: '/about#why', body: 'Real analytics on watch velocity, problem solving and syllabus coverage.', badge: 'Smart', active: true },
      { _key: 'pf9', icon: 'trophy', title: 'Exam Leaderboards', href: '/about#why', body: 'Real-time test rankings to benchmark your preparation nationwide.', badge: 'Competitive', active: true },
      { _key: 'pf10', icon: 'award', title: 'Verified Certificates', href: '/about#why', body: 'Issued automatically when completion criteria are met on the server.', badge: 'Authentic', active: true },
      { _key: 'pf11', icon: 'compass', title: 'Career Roadmaps', href: '/career', body: 'Actionable roadmaps and entrance guides for higher education and careers.', badge: 'Future', active: true },
    ],
  },
  impact: {
    eyebrow: 'OUR IMPACT',
    heading: 'Numbers we can actually stand behind',
    headingHighlight: 'stand behind',
    description: 'These counts come directly from our live server database. We never invent fake learning hours or false claims.',
    note: '',
    customStats: [],
  },
  futureVision: {
    eyebrow: "WHERE WE'RE GOING",
    heading: 'A larger, more personal recorded-learning ecosystem.',
    headingHighlight: 'more personal',
    description: 'The next chapter is deeper analytics, stronger career support and more programmes — still recorded-first.',
    imageUrl: '/practice-workspace.png',
    steps: [
      { _key: 'fv1', title: 'Better learning', body: 'Clearer recorded lessons, downloadable notes and tighter practice loops.', tag: 'Curriculum', active: true },
      { _key: 'fv2', title: 'Smarter analytics', body: 'Richer insight from real watch time and question attempt velocity.', tag: 'Data', active: true },
      { _key: 'fv3', title: 'More personalised education', body: 'Backlog analysis and custom recommendations based on actual progress.', tag: 'Adaptive', active: true },
      { _key: 'fv4', title: 'Stronger career support', body: 'Deeper roadmaps, entrance articles and direct faculty career guidance.', tag: 'Career', active: true },
      { _key: 'fv5', title: 'Larger learning ecosystem', body: 'More courses, batches and specialized faculty — remaining recorded-first.', tag: 'Growth', active: true },
    ],
  },
  cta: {
    eyebrow: 'START TODAY',
    heading: 'Be part of the Gyan Chowk learning journey.',
    headingHighlight: 'learning journey',
    description: 'Start with a recorded course built for serious learners. Join thousands of students mastering their syllabus today.',
    primaryButtonText: 'Explore Courses',
    primaryButtonLink: '/courses',
    secondaryButtonText: 'Create Account',
    secondaryButtonLink: '/register',
    bannerImageUrl: '',
    badges: [
      { _key: 'ct1', text: '50,000+ Learners', icon: 'users', active: true },
      { _key: 'ct2', text: 'Verified Certificates', icon: 'award', active: true },
      { _key: 'ct3', text: 'Instant Doubt Support', icon: 'help', active: true },
    ],
  },
};

export function normalizeAboutPageConfig(raw?: any): AboutPageConfig {
  const DEF = DEFAULT_ABOUT_PAGE_CONFIG;
  if (!raw || typeof raw !== 'object') return DEF;

  const rawWhy = raw.whyGyanChowk || raw.why || {};
  const rawEco = raw.learningEcosystem || raw.ecosystem || {};
  const rawPlat = raw.platformFeatures || raw.platform || {};
  const rawFut = raw.futureVision || raw.future || {};
  const rawCta = raw.cta || {};

  return {
    hero: {
      eyebrow: raw.hero?.eyebrow || DEF.hero.eyebrow,
      heading: raw.hero?.heading || raw.hero?.title || DEF.hero.heading,
      headingHighlight: raw.hero?.headingHighlight || DEF.hero.headingHighlight,
      description: raw.hero?.description || DEF.hero.description,
      primaryCtaText: raw.hero?.primaryCtaText || DEF.hero.primaryCtaText,
      primaryCtaLink: raw.hero?.primaryCtaLink || raw.hero?.primaryCtaUrl || DEF.hero.primaryCtaLink,
      secondaryCtaText: raw.hero?.secondaryCtaText || DEF.hero.secondaryCtaText,
      secondaryCtaLink: raw.hero?.secondaryCtaLink || raw.hero?.secondaryCtaUrl || DEF.hero.secondaryCtaLink,
      imageUrl: raw.hero?.imageUrl || DEF.hero.imageUrl,
      imageAlt: raw.hero?.imageAlt || DEF.hero.imageAlt,
      badgeText: raw.hero?.badgeText || '',
      badges: Array.isArray(raw.hero?.badges) && raw.hero.badges.length > 0 ? raw.hero.badges : DEF.hero.badges,
      stats: Array.isArray(raw.hero?.stats) && raw.hero.stats.length > 0 ? raw.hero.stats : DEF.hero.stats,
    },
    mission: {
      eyebrow: raw.mission?.eyebrow || DEF.mission.eyebrow,
      heading: raw.mission?.heading || raw.mission?.title || DEF.mission.heading,
      headingHighlight: raw.mission?.headingHighlight || raw.mission?.titleHighlight || DEF.mission.headingHighlight,
      body: raw.mission?.body || DEF.mission.body,
      quote: raw.mission?.quote || DEF.mission.quote,
      quoteAuthor: raw.mission?.quoteAuthor || DEF.mission.quoteAuthor,
      imageUrl: raw.mission?.imageUrl || DEF.mission.imageUrl,
      imageAlt: raw.mission?.imageAlt || DEF.mission.imageAlt,
      badgePills: Array.isArray(raw.mission?.badgePills) ? raw.mission.badgePills : [],
    },
    vision: {
      eyebrow: raw.vision?.eyebrow || DEF.vision.eyebrow,
      heading: raw.vision?.heading || raw.vision?.title || DEF.vision.heading,
      headingHighlight: raw.vision?.headingHighlight || raw.vision?.titleHighlight || DEF.vision.headingHighlight,
      description: raw.vision?.description || raw.vision?.body || DEF.vision.description,
      stages: Array.isArray(raw.vision?.stages) && raw.vision.stages.length > 0
        ? raw.vision.stages.map((s: any, idx: number) => ({
            _key: s._key || `v-${idx}`,
            title: s.title || `Stage ${idx + 1}`,
            body: s.body || s.description || '',
            icon: s.icon || 'sparkles',
            active: s.active !== false,
            order: s.order || idx + 1,
          }))
        : DEF.vision.stages,
    },
    whyGyanChowk: {
      eyebrow: rawWhy.eyebrow || DEF.whyGyanChowk.eyebrow,
      heading: rawWhy.heading || rawWhy.title || DEF.whyGyanChowk.heading,
      headingHighlight: rawWhy.headingHighlight || rawWhy.titleHighlight || DEF.whyGyanChowk.headingHighlight,
      description: rawWhy.description || rawWhy.subtitle || DEF.whyGyanChowk.description,
      items: Array.isArray(rawWhy.items) && rawWhy.items.length > 0
        ? rawWhy.items.map((r: any, idx: number) => ({
            _key: r._key || `w-${idx}`,
            title: r.title || `Feature ${idx + 1}`,
            body: r.body || r.description || '',
            accent: r.accent || DEF.whyGyanChowk.items[idx]?.accent || 'amber',
            order: r.order ?? idx + 1,
            active: r.active !== false,
            tag: r.tag || '',
            icon: r.icon || '',
          }))
        : Array.isArray(rawWhy.reasons) && rawWhy.reasons.length > 0
        ? rawWhy.reasons.map((r: any, idx: number) => ({
            _key: r._key || `w-${idx}`,
            title: r.title || `Feature ${idx + 1}`,
            body: r.body || r.description || '',
            accent: r.accent || DEF.whyGyanChowk.items[idx]?.accent || 'amber',
            order: r.order ?? idx + 1,
            active: r.active !== false,
            tag: r.tag || '',
            icon: r.icon || '',
          }))
        : DEF.whyGyanChowk.items,
    },
    learningEcosystem: {
      eyebrow: rawEco.eyebrow || DEF.learningEcosystem.eyebrow,
      heading: rawEco.heading || rawEco.title || DEF.learningEcosystem.heading,
      headingHighlight: rawEco.headingHighlight || rawEco.titleHighlight || DEF.learningEcosystem.headingHighlight,
      description: rawEco.description || rawEco.subtitle || DEF.learningEcosystem.description,
      hubTitle: rawEco.hubTitle || '',
      hubSubtitle: rawEco.hubSubtitle || '',
      nodes: Array.isArray(rawEco.nodes) && rawEco.nodes.length > 0
        ? rawEco.nodes.map((n: any, idx: number) => ({
            _key: n._key || `e-${idx}`,
            name: n.name || n.title || 'Node',
            href: n.href || n.url || '/courses',
            icon: n.icon || 'book',
            badge: n.badge || 'Active',
            active: n.active !== false,
          }))
        : DEF.learningEcosystem.nodes,
    },
    values: {
      eyebrow: raw.values?.eyebrow || DEF.values.eyebrow,
      heading: raw.values?.heading || raw.values?.title || DEF.values.heading,
      headingHighlight: raw.values?.headingHighlight || raw.values?.titleHighlight || DEF.values.headingHighlight,
      description: raw.values?.description || raw.values?.subtitle || DEF.values.description,
      items: Array.isArray(raw.values?.items) && raw.values.items.length > 0
        ? raw.values.items.map((v: any, idx: number) => ({
            _key: v._key || `va-${idx}`,
            title: v.title || `Value ${idx + 1}`,
            body: v.body || v.description || '',
            icon: v.icon || 'sparkles',
            colorVariant: v.colorVariant || 'blue',
            active: v.active !== false,
          }))
        : DEF.values.items,
    },
    platformFeatures: {
      eyebrow: rawPlat.eyebrow || DEF.platformFeatures.eyebrow,
      heading: rawPlat.heading || rawPlat.title || DEF.platformFeatures.heading,
      headingHighlight: rawPlat.headingHighlight || rawPlat.titleHighlight || DEF.platformFeatures.headingHighlight,
      description: rawPlat.description || rawPlat.subtitle || DEF.platformFeatures.description,
      items: Array.isArray(rawPlat.items) && rawPlat.items.length > 0
        ? rawPlat.items.map((item: any) => ({
            ...item,
            badge: item.badge && item.badge.trim().toLowerCase() !== 'recorded' ? item.badge : '',
          }))
        : Array.isArray(rawPlat.features) && rawPlat.features.length > 0
        ? rawPlat.features.map((f: any, idx: number) => ({
            _key: f._key || `pf-${idx}`,
            title: f.title || `Feature ${idx + 1}`,
            body: f.body || f.description || '',
            href: f.href || f.url || '/courses',
            icon: f.icon || 'book',
            badge: f.badge && f.badge.trim().toLowerCase() !== 'recorded' ? f.badge : '',
            active: f.active !== false,
          }))
        : DEF.platformFeatures.items,
    },
    impact: {
      eyebrow: raw.impact?.eyebrow || DEF.impact.eyebrow,
      heading: raw.impact?.heading || raw.impact?.title || DEF.impact.heading,
      headingHighlight: raw.impact?.headingHighlight || raw.impact?.titleHighlight || DEF.impact.headingHighlight,
      description: raw.impact?.description || raw.impact?.body || DEF.impact.description,
      note: raw.impact?.note || '',
      customStats: Array.isArray(raw.impact?.customStats) ? raw.impact.customStats : [],
    },
    futureVision: {
      eyebrow: rawFut.eyebrow || DEF.futureVision.eyebrow,
      heading: rawFut.heading || rawFut.title || DEF.futureVision.heading,
      headingHighlight: rawFut.headingHighlight || rawFut.titleHighlight || DEF.futureVision.headingHighlight,
      description: rawFut.description || rawFut.body || DEF.futureVision.description,
      imageUrl: rawFut.imageUrl || DEF.futureVision.imageUrl,
      steps: Array.isArray(rawFut.steps) && rawFut.steps.length > 0
        ? rawFut.steps.map((s: any, idx: number) => ({
            _key: s._key || `fv-${idx}`,
            title: s.title || `Step ${idx + 1}`,
            body: s.body || s.description || '',
            tag: s.tag || 'Upcoming',
            active: s.active !== false,
          }))
        : DEF.futureVision.steps,
    },
    cta: {
      eyebrow: rawCta.eyebrow || DEF.cta.eyebrow,
      heading: rawCta.heading || rawCta.title || DEF.cta.heading,
      headingHighlight: rawCta.headingHighlight || rawCta.titleHighlight || DEF.cta.headingHighlight,
      description: rawCta.description || rawCta.body || DEF.cta.description,
      primaryButtonText: rawCta.primaryButtonText || rawCta.primaryCtaText || DEF.cta.primaryButtonText,
      primaryButtonLink: rawCta.primaryButtonLink || rawCta.primaryCtaUrl || DEF.cta.primaryButtonLink,
      secondaryButtonText: rawCta.secondaryButtonText || rawCta.secondaryCtaText || DEF.cta.secondaryButtonText,
      secondaryButtonLink: rawCta.secondaryButtonLink || rawCta.secondaryCtaUrl || DEF.cta.secondaryButtonLink,
      bannerImageUrl: rawCta.bannerImageUrl || DEF.cta.bannerImageUrl,
      badges: Array.isArray(rawCta.badges) && rawCta.badges.length > 0 ? rawCta.badges : DEF.cta.badges,
    },
  };
}

export interface CareerJob {
  _id?: string;
  title: string;
  department: string;
  location: string;
  workMode?: 'Remote' | 'On-site' | 'Hybrid';
  employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  experience?: string;
  salaryRange?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  qualifications?: string[];
  skills?: string[];
  icon?: string;
  applyLink?: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CareerHeroConfig {
  badge: string;
  heading: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  ctaText: string;
  ctaLink: string;
  benefits: Array<{ id: string; text: string; icon: string; active: boolean }>;
  active: boolean;
}

export interface CareerWhyCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  active: boolean;
}

export interface CareerWhyConfig {
  eyebrow: string;
  heading: string;
  description: string;
  cards: CareerWhyCard[];
  active: boolean;
}

export interface CareerOpenPositionsHeaderConfig {
  eyebrow: string;
  heading: string;
  description: string;
  active: boolean;
}

export interface CareerLifeCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  imageUrl: string;
  order: number;
  active: boolean;
}

export interface CareerLifeConfig {
  eyebrow: string;
  heading: string;
  description: string;
  cards: CareerLifeCard[];
  active: boolean;
}

export interface CareerTestimonialItem {
  id: string;
  name: string;
  designation: string;
  quote: string;
  photoUrl: string;
  order: number;
  active: boolean;
}

export interface CareerTestimonialsConfig {
  eyebrow: string;
  heading: string;
  items: CareerTestimonialItem[];
  active: boolean;
}

export interface CareerCTAConfig {
  heading: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  active: boolean;
}

export interface CareerPageConfig {
  hero: CareerHeroConfig;
  whyWorkWithUs: CareerWhyConfig;
  openPositionsHeader: CareerOpenPositionsHeaderConfig;
  lifeAtGyanChowk: CareerLifeConfig;
  testimonials: CareerTestimonialsConfig;
  cta: CareerCTAConfig;
}

export const DEFAULT_CAREER_PAGE_CONFIG: CareerPageConfig = {
  hero: {
    badge: 'JOIN OUR TEAM',
    heading: 'Build Your\nFuture With Us',
    description: "At Gyan Chowk, we're not just building an ed-tech platform — we're building a team of passionate learners, creators and innovators.",
    imageUrl: '/career-hero.jpg',
    imageAlt: 'Build your future with Gyan Chowk',
    ctaText: 'Explore Open Positions',
    ctaLink: '#open-positions',
    benefits: [
      { id: 'b1', text: 'Meaningful Work', icon: 'graduation-cap', active: true },
      { id: 'b2', text: 'Growth Opportunities', icon: 'users', active: true },
      { id: 'b3', text: 'Supportive Culture', icon: 'heart', active: true },
    ],
    active: true,
  },
  whyWorkWithUs: {
    eyebrow: 'WHY WORK WITH US',
    heading: 'More Than Just a Job',
    description: "We believe in people, purpose, and progress. Here's why you'll love being a part of Gyan Chowk.",
    cards: [
      { id: 'w1', icon: 'rocket', title: 'Meaningful Work', description: 'Help millions of students achieve their dreams.', order: 1, active: true },
      { id: 'w2', icon: 'trending-up', title: 'Growth Opportunities', description: 'Learn, upskill and advance your career.', order: 2, active: true },
      { id: 'w3', icon: 'users', title: 'Supportive Culture', description: 'Work with a passionate and collaborative team.', order: 3, active: true },
      { id: 'w4', icon: 'lightbulb', title: 'Innovative Environment', description: 'Be part of a learning company that builds the future.', order: 4, active: true },
      { id: 'w5', icon: 'star', title: 'Competitive Benefits', description: 'Attractive compensation, flexible work and more.', order: 5, active: true },
    ],
    active: true,
  },
  openPositionsHeader: {
    eyebrow: 'OPEN POSITIONS',
    heading: 'Find Your Next Opportunity',
    description: 'We are always looking for talented and passionate individuals to join our growing team.',
    active: true,
  },
  lifeAtGyanChowk: {
    eyebrow: 'LIFE AT GYAN CHOWK',
    heading: 'Learn. Grow. Belong.',
    description: 'From flexible work culture to continuous learning, we make sure you have everything you need to do your best work.',
    cards: [
      { id: 'l1', icon: 'users', title: 'Collaborative Teams', description: 'Work with passionate and supportive colleagues.', imageUrl: '/career-life-1.jpg', order: 1, active: true },
      { id: 'l2', icon: 'book-open', title: 'Learning & Development', description: 'Access to courses, workshops and growth resources.', imageUrl: '/career-life-2.jpg', order: 2, active: true },
      { id: 'l3', icon: 'heart', title: 'Flexible Work Culture', description: 'Work from anywhere, be your best self.', imageUrl: '/career-life-3.jpg', order: 3, active: true },
      { id: 'l4', icon: 'send', title: 'Make an Impact', description: 'Help shape the future of education in India.', imageUrl: '/career-life-4.jpg', order: 4, active: true },
    ],
    active: true,
  },
  testimonials: {
    eyebrow: 'WHAT OUR TEAM SAYS',
    heading: 'Real People. Real Stories.',
    items: [
      { id: 't1', name: 'Riya Sharma', designation: 'Content Creator', quote: 'Gyan Chowk gave me the platform to do what I love. The team is incredibly supportive, and the work here truly makes a difference.', photoUrl: '/career-testimonial-1.jpg', order: 1, active: true },
      { id: 't2', name: 'Aman Verma', designation: 'Full Stack Engineer', quote: 'Working at Gyan Chowk allows me to solve real educational challenges that impact students nationwide every single day.', photoUrl: '/career-testimonial-1.jpg', order: 2, active: true },
    ],
    active: true,
  },
  cta: {
    heading: 'Ready to Build Your Future With Us?',
    description: 'Join Gyan Chowk and be a part of our mission to make quality education accessible to everyone.',
    buttonText: 'View Open Positions',
    buttonLink: '#open-positions',
    active: true,
  },
};

export function normalizeCareerPageConfig(raw?: any): CareerPageConfig {
  const DEF = DEFAULT_CAREER_PAGE_CONFIG;
  if (!raw || typeof raw !== 'object') return DEF;

  return {
    hero: {
      badge: raw.hero?.badge ?? DEF.hero.badge,
      heading: raw.hero?.heading ?? DEF.hero.heading,
      description: raw.hero?.description ?? DEF.hero.description,
      imageUrl: raw.hero?.imageUrl || DEF.hero.imageUrl,
      imageAlt: raw.hero?.imageAlt || DEF.hero.imageAlt,
      ctaText: raw.hero?.ctaText || DEF.hero.ctaText,
      ctaLink: raw.hero?.ctaLink || DEF.hero.ctaLink,
      benefits: Array.isArray(raw.hero?.benefits) && raw.hero.benefits.length > 0
        ? raw.hero.benefits
        : DEF.hero.benefits,
      active: raw.hero?.active !== false,
    },
    whyWorkWithUs: {
      eyebrow: raw.whyWorkWithUs?.eyebrow ?? DEF.whyWorkWithUs.eyebrow,
      heading: raw.whyWorkWithUs?.heading ?? DEF.whyWorkWithUs.heading,
      description: raw.whyWorkWithUs?.description ?? DEF.whyWorkWithUs.description,
      cards: Array.isArray(raw.whyWorkWithUs?.cards) && raw.whyWorkWithUs.cards.length > 0
        ? raw.whyWorkWithUs.cards
        : DEF.whyWorkWithUs.cards,
      active: raw.whyWorkWithUs?.active !== false,
    },
    openPositionsHeader: {
      eyebrow: raw.openPositionsHeader?.eyebrow ?? DEF.openPositionsHeader.eyebrow,
      heading: raw.openPositionsHeader?.heading ?? DEF.openPositionsHeader.heading,
      description: raw.openPositionsHeader?.description ?? DEF.openPositionsHeader.description,
      active: raw.openPositionsHeader?.active !== false,
    },
    lifeAtGyanChowk: {
      eyebrow: raw.lifeAtGyanChowk?.eyebrow ?? DEF.lifeAtGyanChowk.eyebrow,
      heading: raw.lifeAtGyanChowk?.heading ?? DEF.lifeAtGyanChowk.heading,
      description: raw.lifeAtGyanChowk?.description ?? DEF.lifeAtGyanChowk.description,
      cards: Array.isArray(raw.lifeAtGyanChowk?.cards) && raw.lifeAtGyanChowk.cards.length > 0
        ? raw.lifeAtGyanChowk.cards
        : DEF.lifeAtGyanChowk.cards,
      active: raw.lifeAtGyanChowk?.active !== false,
    },
    testimonials: {
      eyebrow: raw.testimonials?.eyebrow ?? DEF.testimonials.eyebrow,
      heading: raw.testimonials?.heading ?? DEF.testimonials.heading,
      items: Array.isArray(raw.testimonials?.items) && raw.testimonials.items.length > 0
        ? raw.testimonials.items
        : DEF.testimonials.items,
      active: raw.testimonials?.active !== false,
    },
    cta: {
      heading: raw.cta?.heading ?? DEF.cta.heading,
      description: raw.cta?.description ?? DEF.cta.description,
      buttonText: raw.cta?.buttonText || DEF.cta.buttonText,
      buttonLink: raw.cta?.buttonLink || DEF.cta.buttonLink,
      active: raw.cta?.active !== false,
    },
  };
}


