'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  PlayCircle,
  CreditCard,
  FileQuestion,
  Award,
  MessageCircleQuestion,
  ShieldCheck,
  Search,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ChevronDown,
  X,
  Video,
  Headphones,
  Sliders,
  Wifi,
  FileText,
  Clock,
  Layers,
  BookOpen,
  Share2,
} from 'lucide-react';
import { Breadcrumbs, PageContainer } from '@/components/layout/Page';

type Category = 'all' | 'video' | 'payments' | 'tests' | 'certificates' | 'doubts';

interface HelpTopic {
  id: string;
  category: 'video' | 'payments' | 'tests' | 'certificates' | 'doubts' | 'account';
  title: string;
  summary: string;
  badge: string;
  gradientTone: 'blue' | 'amber' | 'cyan' | 'violet' | 'rose' | 'slate';
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  linkText: string;
  linkHref: string;
}

const HELP_TOPICS: HelpTopic[] = [
  // --- VIDEO WATCHING ---
  {
    id: 'watching-videos-resume',
    category: 'video',
    title: 'Watching videos & auto-resume',
    summary:
      'Open Learning from the student panel. All lectures are studio-recorded with adaptive HLS video streaming, high bitrate audio, and persistent resume.',
    badge: 'HLS Playback & Resume',
    gradientTone: 'blue',
    icon: PlayCircle,
    features: [
      'Resumes playback from your exact last second across any device',
      'Adaptive streaming automatically adjusts to 1080p, 720p, 480p, or 360p',
      'Synchronizes lecture progress automatically to your course dashboard',
    ],
    linkText: 'Go to My Learning',
    linkHref: '/student',
  },
  {
    id: 'watching-videos-speed',
    category: 'video',
    title: 'Speed controls & keyboard shortcuts',
    summary:
      'Customize your study pace. Adjust playback speeds and navigate chapters with built-in accessibility hotkeys.',
    badge: '0.75x to 2.0x Speeds',
    gradientTone: 'blue',
    icon: Sliders,
    features: [
      'Variable speed toggles (0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x) with pitch correction',
      'Keyboard shortcuts: Space for play/pause, Left/Right arrows for ±5s seek',
      'Interactive chapter menu to jump directly to specific sub-topics',
    ],
    linkText: 'Open Student Panel',
    linkHref: '/student',
  },
  {
    id: 'watching-videos-buffering',
    category: 'video',
    title: 'Low-bandwidth & buffering guide',
    summary:
      'Smooth playback even on slow mobile networks. Tips and settings for uninterrupted video watching.',
    badge: 'Network Optimization',
    gradientTone: 'blue',
    icon: Wifi,
    features: [
      'Lock video quality manually to 480p or 360p if your connection is unstable',
      'Downloadable lecture slide decks and summary PDFs for offline review',
      'High-speed content delivery nodes across India for minimal buffering',
    ],
    linkText: 'Explore Course Materials',
    linkHref: '/courses',
  },

  // --- PAYMENTS ---
  {
    id: 'payments-razorpay',
    category: 'payments',
    title: 'Payments & instant course unlock',
    summary:
      'Checkout uses Razorpay with end-to-end 256-bit encryption. Course access is unlocked automatically immediately after server verification.',
    badge: 'Razorpay Instant Access',
    gradientTone: 'amber',
    icon: CreditCard,
    features: [
      'Supports all UPI apps (Google Pay, PhonePe, Paytm), Credit/Debit cards & NetBanking',
      'Automated server webhook confirms your enrollment within 5–30 seconds',
      'Zero convenience fees or hidden surcharges at checkout',
    ],
    linkText: 'Browse Courses',
    linkHref: '/courses',
  },
  {
    id: 'payments-verification',
    category: 'payments',
    title: 'Payment deducted but locked?',
    summary:
      'If your bank debited your account but the course is not immediately visible, our automated verification system will resolve it.',
    badge: 'Payment Reconciliation',
    gradientTone: 'amber',
    icon: Clock,
    features: [
      'Wait 60 seconds and refresh your student dashboard',
      'Have your Razorpay Payment ID from your bank SMS ready',
      'Admins manually verify and unlock edge-case failed webhooks promptly',
    ],
    linkText: 'Contact Payment Support',
    linkHref: '/contact',
  },
  {
    id: 'payments-refund',
    category: 'payments',
    title: 'Refund policy & invoice download',
    summary:
      'Transparent refund terms and automated GST tax invoices generated for every successful enrollment.',
    badge: 'Invoices & Refunds',
    gradientTone: 'amber',
    icon: FileText,
    features: [
      'Review refund eligibility criteria and timelines on the refund policy page',
      'Official GST tax invoice delivered straight to your registered email',
      'Approved refunds credited back to the original source payment method',
    ],
    linkText: 'View Refund Policy',
    linkHref: '/refund-policy',
  },

  // --- TESTS ---
  {
    id: 'tests-autosave',
    category: 'tests',
    title: 'Tests & real-time autosave',
    summary:
      'Assessment portal with real-time answer autosave. Submit before the countdown timer ends to generate your comprehensive performance breakdown.',
    badge: 'Autosave Protection',
    gradientTone: 'cyan',
    icon: FileQuestion,
    features: [
      'Answers autosave per question — never lost if internet fluctuates or disconnects',
      'Resume your test on any device within the active exam duration window',
      'Clean multi-choice interface with clear question navigation palette',
    ],
    linkText: 'View My Tests',
    linkHref: '/student',
  },
  {
    id: 'tests-timer',
    category: 'tests',
    title: 'Timer rules & automatic submit',
    summary:
      'Structured examination rules designed to simulate real competition conditions with built-in safeguards.',
    badge: 'Live Countdown Timer',
    gradientTone: 'cyan',
    icon: Clock,
    features: [
      'Prominent visual countdown timer with 5-minute and 1-minute alert badges',
      'Automatic graceful submission when the timer reaches zero',
      'Review unanswered and flagged questions before final submission',
    ],
    linkText: 'Go to Student Dashboard',
    linkHref: '/student',
  },
  {
    id: 'tests-analytics',
    category: 'tests',
    title: 'Scorecards & answer explanations',
    summary:
      'Detailed analytical breakdown generated instantly upon submission to guide your revision.',
    badge: 'Performance Analytics',
    gradientTone: 'cyan',
    icon: Layers,
    features: [
      'Instant overall score, percentile, and accuracy percentage',
      'Comprehensive step-by-step solution keys for every question',
      'Topic-wise diagnostics highlighting conceptual areas needing revision',
    ],
    linkText: 'Check Test Records',
    linkHref: '/student',
  },

  // --- CERTIFICATES ---
  {
    id: 'certificates-eligibility',
    category: 'certificates',
    title: 'Certificates & 90% criteria',
    summary:
      'Issued near 90% completion. Every certificate contains a unique cryptographic ID and can be publicly verified at /verify/certificate/[id].',
    badge: 'Tamper-Proof Credential',
    gradientTone: 'violet',
    icon: Award,
    features: [
      'Unlocks automatically once you complete ≥90% of lectures and pass benchmark tests',
      'Live progress bar in your student panel tracks your certification milestone',
      'Signed digitally with course title, student name, and issue date',
    ],
    linkText: 'Verify a Certificate',
    linkHref: '/verify/certificate',
  },
  {
    id: 'certificates-verification',
    category: 'certificates',
    title: 'Public verification & sharing',
    summary:
      'Showcase your verified achievement to recruiters, universities, and professional networks.',
    badge: 'Public Verification URL',
    gradientTone: 'violet',
    icon: Share2,
    features: [
      'Permanent verification URL: /verify/certificate/[id] accessible worldwide',
      'Scannable QR code embedded on the certificate confirming credentials',
      'One-click add to LinkedIn Licenses & Certifications profile',
    ],
    linkText: 'Open Certificate Lookup',
    linkHref: '/verify/certificate',
  },
  {
    id: 'certificates-download',
    category: 'certificates',
    title: 'High-resolution PDF download',
    summary:
      'Download your credential as a print-ready vector PDF for portfolios, CVs, and framing.',
    badge: 'Vector PDF Download',
    gradientTone: 'violet',
    icon: FileText,
    features: [
      'High-resolution vector PDF export with official Gyan Chowk insignia',
      'Lifetime cloud storage — re-download anytime from your student profile',
      'Accepted for educational and professional portfolio submissions',
    ],
    linkText: 'Student Dashboard',
    linkHref: '/student',
  },

  // --- DOUBTS ---
  {
    id: 'doubts-desk',
    category: 'doubts',
    title: 'Doubt support & mentorship',
    summary:
      'Even without live classrooms, you are never alone. Submit questions on specific timestamps, and teachers respond with detailed written explanations.',
    badge: 'Asynchronous Helpdesk',
    gradientTone: 'rose',
    icon: MessageCircleQuestion,
    features: [
      'Tag video timestamps or upload screenshots of difficult questions',
      'Verified teacher explanations saved directly to your study panel',
      'Receive notification alerts when your instructor answers your query',
    ],
    linkText: 'Ask a Doubt',
    linkHref: '/student/doubts',
  },
  {
    id: 'doubts-archive',
    category: 'doubts',
    title: 'Doubt search & community answers',
    summary:
      'Browse through hundreds of resolved student questions and concept explanations for your course batch.',
    badge: 'Solved Questions Vault',
    gradientTone: 'rose',
    icon: BookOpen,
    features: [
      'Search existing answered queries before posting to get immediate solutions',
      'High-yield tricky questions curated by top faculty members',
      'Bookmark key discussions for rapid pre-exam revision',
    ],
    linkText: 'Open Doubt Portal',
    linkHref: '/student/doubts',
  },

  // --- ACCOUNT & ACCESS ---
  {
    id: 'account-security',
    category: 'account',
    title: 'Account & access safety',
    summary:
      'Self-service account management, password recovery, session tokens, and security to keep your study material protected.',
    badge: 'Secure Authentication',
    gradientTone: 'slate',
    icon: ShieldCheck,
    features: [
      'Secure HttpOnly cookie session management without third-party tracking',
      'Instant password reset link sent to your registered email',
      'Switch between laptop and mobile seamlessly with saved history',
    ],
    linkText: 'Reset Password',
    linkHref: '/forgot-password',
  },
];

const FAQS = [
  {
    id: 'faq-1',
    category: 'video',
    question: 'Why does Gyan Chowk offer recorded classes instead of live sessions?',
    answer:
      'Recorded learning gives you maximum freedom, zero distraction, and consistent studio-grade quality. You can learn at your own pace, pause to take notes, adjust speed from 0.75x to 2x, and rewatch challenging concepts anytime without being tied down to fixed schedules or facing live network drops.',
  },
  {
    id: 'faq-2',
    category: 'video',
    question: 'What should I do if a video buffers or fails to play smoothly?',
    answer:
      'Our player uses adaptive HLS (HTTP Live Streaming) that automatically matches your connection speed. If you encounter buffering, lower the video resolution in the player settings, check that hardware acceleration is enabled in your browser, or refresh your session. If problems persist, clear your browser cache.',
  },
  {
    id: 'faq-3',
    category: 'payments',
    question: 'My payment was deducted, but my course is not yet unlocked. What should I do?',
    answer:
      'Access unlocks automatically the moment Razorpay confirms payment to our backend (normally within 5–30 seconds). First, refresh your Student Dashboard. If access is still pending, check your email for the Razorpay Payment ID and reach out through our Contact page; our administrators will verify and unlock your enrollment promptly.',
  },
  {
    id: 'faq-4',
    category: 'payments',
    question: 'Can I get a refund if the course is not suitable for me?',
    answer:
      'Refunds are processed by Gyan Chowk administrators in accordance with our refund policy. If your enrollment qualifies, submit a request via our Contact page with your registered email and Order ID. Approved refunds are credited directly back to the original source method.',
  },
  {
    id: 'faq-5',
    category: 'tests',
    question: 'What happens if my connection disconnects during a test?',
    answer:
      'Every answer you select is autosaved immediately to the server. If your device restarts or internet drops, reconnect and return to the test page before the countdown timer expires. Your previously chosen answers will remain intact, and you can continue answering the remaining questions.',
  },
  {
    id: 'faq-6',
    category: 'tests',
    question: 'Can I review explanations and solutions after submitting an assessment?',
    answer:
      'Yes! As soon as you submit your test, you receive a full scorecard with question-by-question explanations, faculty solutions, and performance analysis. You can also re-visit past test reports from your Student Portal at any time.',
  },
  {
    id: 'faq-7',
    category: 'certificates',
    question: 'How do I download or share my certificate with employers?',
    answer:
      'When your course syllabus completion hits ~90% and you clear the necessary tests, your certificate unlocks automatically in your Student Portal under the Certificates tab. You can download the PDF or share the public verification link: /verify/certificate/[id]. Anyone can verify its legitimacy in real time.',
  },
  {
    id: 'faq-8',
    category: 'doubts',
    question: 'How do I get my questions answered if there are no live classes?',
    answer:
      'Visit the Student Doubt Desk from your portal or batch page. You can type your question, mention the exact lesson and timestamp, or attach a photo. Our subject matter mentors review queries and post detailed solutions directly to your dashboard.',
  },
];

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'All Topics', value: 'all' },
  { label: 'Watching Videos', value: 'video' },
  { label: 'Payments', value: 'payments' },
  { label: 'Tests', value: 'tests' },
  { label: 'Certificates', value: 'certificates' },
  { label: 'Doubts', value: 'doubts' },
];

export function HelpCentreClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');

  // Compute category counts for pills
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      all: HELP_TOPICS.length,
      video: 0,
      payments: 0,
      tests: 0,
      certificates: 0,
      doubts: 0,
    };
    for (const t of HELP_TOPICS) {
      if (t.category in counts) {
        counts[t.category as Category]++;
      }
    }
    return counts;
  }, []);

  const filteredTopics = useMemo(() => {
    return HELP_TOPICS.filter((topic) => {
      const matchesCategory =
        selectedCategory === 'all' || topic.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        topic.title.toLowerCase().includes(q) ||
        topic.summary.toLowerCase().includes(q) ||
        topic.badge.toLowerCase().includes(q) ||
        topic.features.some((f) => f.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const filteredFaqs = useMemo(() => {
    return FAQS.filter((faq) => {
      const matchesCategory =
        selectedCategory === 'all' || faq.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        faq.question.toLowerCase().includes(q) ||
        faq.answer.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  const getToneStyle = (tone: HelpTopic['gradientTone']) => {
    switch (tone) {
      case 'blue':
        return {
          iconBg: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/60',
          borderHover: 'hover:border-blue-300',
        };
      case 'amber':
        return {
          iconBg: 'bg-gradient-to-br from-amber-600 via-orange-600 to-stone-900',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/60',
          borderHover: 'hover:border-amber-300',
        };
      case 'cyan':
        return {
          iconBg: 'bg-gradient-to-br from-teal-600 via-cyan-600 to-slate-900',
          badgeBg: 'bg-teal-50 text-teal-800 border-teal-200/60',
          borderHover: 'hover:border-teal-300',
        };
      case 'violet':
        return {
          iconBg: 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-950',
          badgeBg: 'bg-violet-50 text-violet-800 border-violet-200/60',
          borderHover: 'hover:border-violet-300',
        };
      case 'rose':
        return {
          iconBg: 'bg-gradient-to-br from-rose-600 via-pink-600 to-stone-900',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200/60',
          borderHover: 'hover:border-rose-300',
        };
      case 'slate':
      default:
        return {
          iconBg: 'bg-gradient-to-br from-slate-700 via-zinc-800 to-neutral-900',
          badgeBg: 'bg-stone-100 text-stone-700 border-stone-200',
          borderHover: 'hover:border-stone-400',
        };
    }
  };

  return (
    <PageContainer className="py-6 sm:py-10 md:py-14">
      {/* 1. Breadcrumbs */}
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Help' }]} />

      {/* 2. Hero Section */}
      <header className="relative mb-10 overflow-hidden rounded-[26px] border border-gc-line bg-gradient-to-b from-[#fffcf7] via-[#faf7f0] to-[#f4eee4] p-6 shadow-sm sm:p-9 md:p-12">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-amber-100/30 blur-3xl"
          aria-hidden
        />

        <div className="relative z-10 max-w-3xl">
          <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-gc-line bg-white/80 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-gc-mute shadow-xs backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Gyan Chowk Support Portal</span>
          </div>

          <h1 className="gc-heading font-display text-3xl font-normal tracking-tight text-gc-black sm:text-4xl md:text-5xl lg:text-5xl">
            Help centre
          </h1>

          <p className="mt-3 text-base leading-relaxed text-gc-mist sm:text-lg">
            Recorded learning support. We do not run live classes.
          </p>

          {/* Recorded Learning Clarification Banner */}
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-white/90 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-4.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-900">
              <Video className="h-5 w-5" />
            </div>
            <div className="min-w-0 text-sm">
              <p className="font-semibold text-amber-950">
                100% Studio-Recorded Learning Platform
              </p>
              <p className="text-amber-900/80">
                Every lecture is accessible 24/7 on demand. Pause, rewind, adjust playback speeds up to 2x, and practice tests at your own schedule without fixed-timetable stress.
              </p>
            </div>
          </div>

          {/* Interactive Search Bar */}
          <div className="mt-6">
            <div className="relative flex items-center">
              <Search className="pointer-events-none absolute left-4 h-5 w-5 text-gc-mute" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guides (e.g. watching videos, Razorpay, certificates, test timer...)"
                autoComplete="off"
                spellCheck={false}
                suppressHydrationWarning
                className="w-full rounded-full border border-gc-line bg-white py-3.5 pl-12 pr-10 text-sm text-gc-black shadow-xs placeholder:text-gc-mute/70 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  suppressHydrationWarning
                  className="absolute right-3.5 flex h-6 w-6 items-center justify-center rounded-full text-gc-mute hover:bg-stone-100 hover:text-gc-black"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* 3. Category Filter Pills */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.value;
          const count = categoryCounts[cat.value] ?? 0;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setSelectedCategory(cat.value)}
              suppressHydrationWarning
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition duration-150 sm:text-sm ${
                isActive
                  ? 'border border-gc-black bg-gc-black text-white shadow-xs'
                  : 'border border-gc-line bg-white text-gc-mist hover:border-gc-black/40 hover:text-gc-black'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold sm:text-xs ${
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-gc-mute'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}

        {searchQuery ? (
          <span className="ml-auto text-xs text-gc-mute">
            Showing results for &ldquo;<strong>{searchQuery}</strong>&rdquo;
          </span>
        ) : null}
      </div>

      {/* 4. Core Knowledge Cards Grid (Clean, instant CSS grid - 100% reliable) */}
      <section aria-labelledby="core-guides-heading" className="mb-14">
        <h2 id="core-guides-heading" className="sr-only">
          Help Guides
        </h2>

        {filteredTopics.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-2">
            {filteredTopics.map((topic) => {
              const Icon = topic.icon;
              const tone = getToneStyle(topic.gradientTone);

              return (
                <article
                  key={topic.id}
                  className={`gc-card group flex h-full flex-col justify-between p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${tone.borderHover}`}
                >
                  <div>
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm ${tone.iconBg}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${tone.badgeBg}`}
                      >
                        {topic.badge}
                      </span>
                    </div>

                    {/* Title & Body */}
                    <h3 className="gc-heading mt-4 font-display text-xl font-medium tracking-tight text-gc-black sm:text-2xl">
                      {topic.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gc-mist">
                      {topic.summary}
                    </p>

                    {/* Feature Bullet Points */}
                    <ul className="mt-4 space-y-2 border-t border-gc-line/60 pt-4 text-xs sm:text-sm">
                      {topic.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-gc-mist"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom Action Link */}
                  <div className="mt-6 pt-3">
                    <Link
                      href={topic.linkHref}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-gc-black transition hover:text-blue-700"
                    >
                      <span>{topic.linkText}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gc-line bg-white/70 p-10 text-center">
            <HelpCircle className="mx-auto h-8 w-8 text-gc-mute" />
            <h3 className="mt-3 font-display text-lg font-medium text-gc-black">
              No matching guides found
            </h3>
            <p className="mt-1 text-sm text-gc-mist">
              Try adjusting your search terms or clearing your category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              suppressHydrationWarning
              className="gc-btn-outline mt-4"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* 5. How Recorded Learning Works: 3 Simple Steps */}
      <section className="mb-14 rounded-3xl border border-gc-line bg-white p-6 sm:p-8 md:p-10 shadow-xs">
        <div className="max-w-2xl">
          <span className="gc-kicker">Self-Paced Architecture</span>
          <h2 className="gc-heading mt-1 font-display text-2xl font-normal text-gc-black sm:text-3xl">
            How recorded learning works on Gyan Chowk
          </h2>
          <p className="mt-2 text-sm text-gc-mist">
            Structured for deep comprehension without rigid attendance pressures or lost lectures.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="relative rounded-2xl border border-gc-line/80 bg-stone-50/50 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-display text-sm font-medium text-white shadow-xs">
              1
            </div>
            <h3 className="mt-4 font-display text-lg font-medium text-gc-black">
              Enroll & Instant Access
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gc-mist sm:text-sm">
              Instant verification unlocks all course modules immediately. Start watching any chapter on demand.
            </p>
          </div>

          <div className="relative rounded-2xl border border-gc-line/80 bg-stone-50/50 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-600 font-display text-sm font-medium text-white shadow-xs">
              2
            </div>
            <h3 className="mt-4 font-display text-lg font-medium text-gc-black">
              Study at Your Pace
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gc-mist sm:text-sm">
              Watch in HD, alter playback speed, take autosaved practice tests, and ask mentor questions with timestamps.
            </p>
          </div>

          <div className="relative rounded-2xl border border-gc-line/80 bg-stone-50/50 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 font-display text-sm font-medium text-white shadow-xs">
              3
            </div>
            <h3 className="mt-4 font-display text-lg font-medium text-gc-black">
              Test & Get Certified
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-gc-mist sm:text-sm">
              Cross 90% watch-time, clear the benchmark tests, and receive an authentic, shareable verification ID.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Expandable FAQ Accordion */}
      <section className="mb-14">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="gc-kicker">Knowledge Base</span>
            <h2 className="gc-heading font-display text-2xl font-normal text-gc-black sm:text-3xl">
              Frequently asked questions {selectedCategory !== 'all' ? `(${selectedCategory})` : ''}
            </h2>
          </div>
          <Link
            href="/faq"
            className="inline-flex items-center gap-1 text-sm font-medium text-gc-mute hover:text-gc-black"
          >
            <span>View complete FAQ library</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div
                key={faq.id}
                className="overflow-hidden rounded-2xl border border-gc-line bg-white transition-colors duration-150"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  aria-expanded={isOpen}
                  suppressHydrationWarning
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-stone-50/70"
                >
                  <span className="font-display text-base font-medium text-gc-black sm:text-lg">
                    {faq.question}
                  </span>
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gc-line transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-stone-100 text-gc-black' : 'text-gc-mute'
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>
                {isOpen ? (
                  <div className="border-t border-gc-line/60 bg-stone-50/40 p-5 pt-3 text-sm leading-relaxed text-gc-mist sm:p-6 sm:pt-4">
                    {faq.answer}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Need More Help? Direct Escalation Footer */}
      <section className="relative overflow-hidden rounded-3xl border border-gc-line bg-gradient-to-br from-stone-900 via-zinc-900 to-black p-6 text-white shadow-lg sm:p-8 md:p-10">
        <div
          className="pointer-events-none absolute -bottom-10 -right-10 h-60 w-60 rounded-full bg-blue-500/10 blur-2xl"
          aria-hidden
        />

        <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <Headphones className="h-3.5 w-3.5" />
              <span>Direct Support Team</span>
            </span>
            <h2 className="mt-3 font-display text-2xl font-normal tracking-tight text-white sm:text-3xl">
              Still have questions or facing an issue?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-300 sm:text-base">
              Our support team is on standby to assist you with order verification, video playback, or doubts. We typically respond within 24–48 business hours.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              href="/contact"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-stone-200"
            >
              Contact Support
            </Link>
            <Link
              href="/student/doubts"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Ask a Doubt
            </Link>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
