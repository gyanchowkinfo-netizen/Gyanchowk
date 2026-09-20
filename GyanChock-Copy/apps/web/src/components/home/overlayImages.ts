const TITLE_IMAGES: Record<string, string> = {
  jee: '/overlays/overlay-jee.png',
  neet: '/overlays/overlay-neet.png',
  boards: '/overlays/overlay-boards.png',
  'government exams': '/overlays/overlay-government.png',
  programming: '/overlays/overlay-programming.png',
  career: '/overlays/overlay-career.png',
  university: '/overlays/overlay-university.png',
  'skill development': '/overlays/overlay-skills.png',
  mathematics: '/overlays/overlay-mathematics.png',
  physics: '/overlays/overlay-physics.png',
  'recorded courses': '/overlays/overlay-recorded.png',
  'recorded lessons': '/overlays/overlay-recorded.png',
  'ranked tests': '/practice-workspace.png',
  'doubt support': '/mentorship-workspace.png',
  'progress tracking': '/overlays/overlay-progress.png',
  certificates: '/overlays/overlay-certificate.png',
  'learning dashboard': '/overlays/overlay-notes.png',
  'bookmarks & notes': '/overlays/overlay-notes.png',
  'practice library': '/overlays/overlay-library.png',
  'structured paths': '/overlays/overlay-library.png',
  'structured learning': '/overlays/overlay-library.png',
  'exam analytics': '/overlays/overlay-progress.png',
  'mock tests': '/practice-workspace.png',
  'previous year papers': '/overlays/overlay-boards.png',
  'exam coverage': '/overlays/overlay-government.png',
  'expert faculty': '/overlays/overlay-faculty.png',
  'practice & testing': '/practice-workspace.png',
  'mentor support': '/mentorship-workspace.png',
  'verified courses': '/overlays/overlay-certificate.png',
};

const KEYWORD_IMAGES: Array<[RegExp, string]> = [
  [/jee|iit|engineering/i, '/overlays/overlay-jee.png'],
  [/neet|medical|biology/i, '/overlays/overlay-neet.png'],
  [/board|school|class/i, '/overlays/overlay-boards.png'],
  [/government|upsc|ssc|bank|railway|civil/i, '/overlays/overlay-government.png'],
  [/program|code|java|python|software/i, '/overlays/overlay-programming.png'],
  [/career|interview|job|resume/i, '/overlays/overlay-career.png'],
  [/skill|workplace|tool/i, '/overlays/overlay-skills.png'],
  [/university|degree|campus|academic/i, '/overlays/overlay-university.png'],
  [/math/i, '/overlays/overlay-mathematics.png'],
  [/physics/i, '/overlays/overlay-physics.png'],
  [/record|video|lesson|play/i, '/overlays/overlay-recorded.png'],
  [/test|mock|rank|paper|timer/i, '/practice-workspace.png'],
  [/doubt|mentor/i, '/mentorship-workspace.png'],
  [/progress|analytic|chart|dashboard/i, '/overlays/overlay-progress.png'],
  [/certificate|verified|award/i, '/overlays/overlay-certificate.png'],
  [/note|bookmark/i, '/overlays/overlay-notes.png'],
  [/library|path|structured/i, '/overlays/overlay-library.png'],
  [/faculty|teacher|educator/i, '/overlays/overlay-faculty.png'],
];

export function overlayImageFor(title: string) {
  const key = title.trim().toLowerCase();
  if (TITLE_IMAGES[key]) return TITLE_IMAGES[key];
  for (const [pattern, src] of KEYWORD_IMAGES) {
    if (pattern.test(title)) return src;
  }
  return '/practice-workspace.png';
}
