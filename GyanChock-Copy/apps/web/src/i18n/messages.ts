export const messages = {
  en: {
    tagline: 'Learn. Code. Grow.',
    nav: {
      courses: 'Courses',
      batches: 'Batches',
      teachers: 'Teachers',
      career: 'Career',
      blog: 'Blog',
      about: 'About',
      login: 'Login',
      register: 'Get started',
    },
    hero: {
      kicker: 'Recorded learning. Serious outcomes.',
      title: 'The chowk where knowledge becomes rank.',
      body: 'Gyan Chowk is built for high-performance recorded courses, batches, tests, doubts, mentorship and career growth — not live-class noise.',
      cta: 'Explore courses',
      secondary: 'Join a batch',
    },
    footer: {
      copy: '© Gyan Chowk. All rights reserved.',
    },
  },
  hi: {
    tagline: 'सीखो. कोड करो. बढ़ो.',
    nav: {
      courses: 'कोर्स',
      batches: 'बैच',
      teachers: 'शिक्षक',
      career: 'करियर',
      blog: 'ब्लॉग',
      about: 'हमारे बारे में',
      login: 'लॉगिन',
      register: 'शुरू करें',
    },
    hero: {
      kicker: 'रिकॉर्डेड लर्निंग. ठोस परिणाम.',
      title: 'ज्ञान चौक — जहाँ मेहनत रैंक बनती है.',
      body: 'गायन चौक रिकॉर्डेड कोर्स, बैच, टेस्ट, डाउट और मेंटरशिप के लिए बनाया गया है। लाइव क्लास यहाँ नहीं हैं।',
      cta: 'कोर्स देखें',
      secondary: 'बैच जॉइन करें',
    },
    footer: {
      copy: '© ज्ञान चौक. सर्वाधिकार सुरक्षित.',
    },
  },
  hinglish: {
    tagline: 'Learn. Code. Grow.',
    nav: {
      courses: 'Courses',
      batches: 'Batches',
      teachers: 'Teachers',
      career: 'Career',
      blog: 'Blog',
      about: 'About',
      login: 'Login',
      register: 'Start karo',
    },
    hero: {
      kicker: 'Recorded learning. Solid results.',
      title: 'Gyan Chowk — jahan padhai rank ban jaye.',
      body: 'Yahan recorded courses, batches, tests, doubts aur mentorship milte hain. Live classes nahi hain.',
      cta: 'Courses dekho',
      secondary: 'Batch join karo',
    },
    footer: {
      copy: '© Gyan Chowk. All rights reserved.',
    },
  },
} as const;

export type Locale = keyof typeof messages;
