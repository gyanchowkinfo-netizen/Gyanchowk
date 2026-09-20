export const EXAM_LINKS = [
  { name: 'JEE', href: '/courses?category=JEE', body: 'Build concepts. Practice deeply. Improve your rank.', tone: 'navy' },
  { name: 'NEET', href: '/courses?category=NEET', body: 'Biology, chemistry and physics — taught with quiet precision.', tone: 'blue' },
  { name: 'Boards', href: '/courses?category=Boards', body: 'Class-wise recorded lessons for calm, complete coverage.', tone: 'violet' },
  { name: 'Government Exams', href: '/courses?category=Government%20exams', body: 'Structured prep for competitive public exams.', tone: 'cyan' },
  { name: 'Programming', href: '/courses?category=Programming', body: 'Write, debug and ship — without the livestream noise.', tone: 'navy' },
  { name: 'Career', href: '/courses?category=Career', body: 'Skills that travel with you after the exam is over.', tone: 'warm' },
  { name: 'University', href: '/courses?category=University', body: 'Degree-aligned recorded modules for deeper academic work.', tone: 'blue' },
  { name: 'Skill Development', href: '/courses?category=Career', body: 'Practical skills for interviews, tools and workplaces.', tone: 'violet' },
  { name: 'Mathematics', href: '/courses?q=Mathematics', body: 'From first principles to timed problem sets.', tone: 'cyan' },
  { name: 'Physics', href: '/courses?q=Physics', body: 'See the model. Then practice until it holds.', tone: 'navy' },
] as const;

export const POPULAR_SEARCHES = [
  { label: 'JEE Physics', href: '/courses?q=JEE%20Physics' },
  { label: 'NEET Biology', href: '/courses?q=NEET%20Biology' },
  { label: 'Mathematics', href: '/courses?q=Mathematics' },
  { label: 'Government Exams', href: '/courses?category=Government%20exams' },
  { label: 'Programming', href: '/courses?category=Programming' },
  { label: 'Career Skills', href: '/career' },
] as const;

export const HERO_SUGGESTIONS = ['JEE', 'NEET', 'Boards', 'Programming', 'Government Exams', 'Career'] as const;

export const HOW_STEPS = [
  { n: '01', title: 'Choose your course', body: 'Pick an exam, subject or skill. The catalogue is built around outcomes.' },
  { n: '02', title: 'Enroll securely', body: 'Checkout completes on the server. Access unlocks after payment is verified.' },
  { n: '03', title: 'Watch recorded lessons', body: 'Pause, rewind and return — without a live-class timetable.' },
  { n: '04', title: 'Practice tests', body: 'Timed papers, negative marking and ranks calculated after you submit.' },
  { n: '05', title: 'Ask doubts', body: 'Write the stuck point. Mentors reply in a thread you can revisit.' },
  { n: '06', title: 'Track your progress', body: 'See what is complete, what is pending, and what deserves another pass.' },
  { n: '07', title: 'Earn a certificate', body: 'Eligible programmes issue a verifiable certificate when rules are met.' },
] as const;

export const PLATFORM_FEATURES = [
  { n: '01', title: 'Recorded Courses', body: 'Pause, resume, revisit and learn at your own pace.', icon: 'play' },
  { n: '02', title: 'Ranked Tests', body: 'Timed papers, negative marking, detailed performance insights.', icon: 'trophy' },
  { n: '03', title: 'Doubt Support', body: 'Ask questions and receive structured mentor responses.', icon: 'message' },
  { n: '04', title: 'Progress Tracking', body: "Know what you've completed and what needs attention.", icon: 'chart' },
  { n: '05', title: 'Certificates', body: 'Complete eligible programs and collect verified certificates.', icon: 'award' },
  { n: '06', title: 'Learning Dashboard', body: 'Everything you need in one focused workspace.', icon: 'layout' },
  { n: '07', title: 'Bookmarks & Notes', body: 'Save important lessons and build your personal revision library.', icon: 'bookmark' },
  { n: '08', title: 'Practice Library', body: 'Topic-wise questions designed for deliberate practice.', icon: 'library' },
  { n: '09', title: 'Structured Paths', body: 'Move through a sequence instead of an endless content dump.', icon: 'path' },
  { n: '10', title: 'Exam Analytics', body: 'Subject-wise feedback after a paper is submitted.', icon: 'target' },
] as const;

export const OUTCOMES = [
  { title: 'Understand', body: 'Concept-first recorded lessons, written so you can stop and think.' },
  { title: 'Practice', body: 'Mocks, topic tests and previous-year patterns without a noisy classroom.' },
  { title: 'Measure', body: 'Ranks, scores and completion from real attempts — not a leaderboard gimmick.' },
  { title: 'Improve', body: 'Doubts, revision and a workspace that remembers where you left off.' },
] as const;

export const FALLBACK_FAQS = [
  {
    _id: 'faq-live',
    question: 'Does Gyan Chowk offer live classes?',
    answer:
      'No. Gyan Chowk is built for recorded learning — so you can pause, resume and revisit without a live-class timetable.',
  },
  {
    _id: 'faq-pay',
    question: 'How do payments work?',
    answer:
      'Checkout is completed on the server. Course access unlocks only after payment is verified — not when a button is clicked in the browser.',
  },
  {
    _id: 'faq-pace',
    question: 'Can I learn at my own pace?',
    answer: 'Yes. Lessons are recorded. Tests are timed when you start them. Mentorship is asynchronous.',
  },
  {
    _id: 'faq-tests',
    question: 'How do tests and rankings work?',
    answer:
      'Papers run with a server timer. Negative marking, autosave and ranks are computed from submitted attempts.',
  },
  {
    _id: 'faq-doubts',
    question: 'How does doubt support work?',
    answer: 'Ask from the student workspace. Attach context, and a mentor replies in a written thread.',
  },
  {
    _id: 'faq-certs',
    question: 'Are certificates provided?',
    answer: 'Eligible courses issue a verifiable certificate when completion rules are met on the server.',
  },
  {
    _id: 'faq-access',
    question: 'How do I access purchased courses?',
    answer: 'Sign in, open the student app, and continue from Learning. Enrolment is checked before playback.',
  },
  {
    _id: 'faq-recorded',
    question: 'How do recorded courses work?',
    answer: 'Lessons are pre-recorded. Pause, rewind and revisit after enrolment is verified — no live-class timetable.',
  },
  {
    _id: 'faq-mobile',
    question: 'Can I access courses on mobile?',
    answer: 'Yes. Sign in from a phone or desktop. Playback still checks enrolment on the server.',
  },
] as const;

export const TRUST_MARKS = [
  'Structured courses',
  'Verified instructors',
  'Secure payments',
  'Progress tracking',
] as const;

export const TEST_TYPES = [
  { name: 'Mock Tests', href: '/student/tests', body: 'Full-length papers with a server timer.' },
  { name: 'Topic Tests', href: '/student/tests', body: 'Short sets for deliberate practice.' },
  { name: 'Previous Year Papers', href: '/student/tests', body: 'Patterns you can sit with, not skim.' },
  { name: 'Ranked Tests', href: '/student/rankings', body: 'See where a real attempt places you.' },
] as const;
