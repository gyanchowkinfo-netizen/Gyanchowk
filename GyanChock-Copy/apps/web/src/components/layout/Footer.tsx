'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useI18n } from '@/i18n/provider';
import { isAppPanelPath } from '@/lib/paths';

const cols = [
  {
    title: 'Platform',
    links: [
      { href: '/courses', label: 'Courses' },
      { href: '/student/tests', label: 'Tests' },
      { href: '/teachers', label: 'Teachers' },
      { href: '/student/certificates', label: 'Certificates' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { href: '/help', label: 'Study guides' },
      { href: '/faq', label: 'Questions' },
      { href: '/student/tests', label: 'Practice' },
      { href: '/student/doubts', label: 'Doubts' },
      { href: '/career', label: 'Career' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/terms-and-conditions', label: 'Terms' },
      { href: '/privacy-policy', label: 'Privacy' },
      { href: '/refund-policy', label: 'Refund Policy' },
    ],
  },
];

function InstagramIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="footerIgGradient" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="6.5" fill="url(#footerIgGradient)" />
      <rect x="3.8" y="3.8" width="16.4" height="16.4" rx="4.8" stroke="#ffffff" strokeWidth="1.7" fill="none" />
      <circle cx="12" cy="12" r="3.7" stroke="#ffffff" strokeWidth="1.7" fill="none" />
      <circle cx="16.8" cy="7.2" r="1.15" fill="#ffffff" />
    </svg>
  );
}

function YouTubeIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#FF0000"
        d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      />
      <polygon fill="#FFFFFF" points="9.545,15.568 15.818,12 9.545,8.432" />
    </svg>
  );
}

function LinkedInIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="4.5" fill="#0A66C2" />
      <path
        fill="#FFFFFF"
        d="M7.12 9.22H4.44v8.59h2.68V9.22zM5.78 4.79c-.86 0-1.42.56-1.42 1.3 0 .73.54 1.3 1.38 1.3h.02c.88 0 1.42-.57 1.42-1.3-.02-.74-.54-1.3-1.4-1.3zm13.78 8.02c0-2.67-1.43-3.92-3.33-3.92-1.54 0-2.22.85-2.6 1.44V9.22h-2.68c.03.75 0 8.59 0 8.59h2.68v-4.8c0-.26.02-.51.1-.7.21-.51.68-1.04 1.48-1.04 1.04 0 1.46.79 1.46 1.96v4.58h2.68v-4.81z"
      />
    </svg>
  );
}

function FacebookIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#FFFFFF"
        d="M16.5 12.073l.532-3.47h-3.328v-2.25c0-.949.465-1.874 1.956-1.874h1.514V1.526s-1.374-.235-2.686-.235c-2.741 0-4.533 1.662-4.533 4.669v2.643H7.078v3.47h3.047v8.385a12.09 12.09 0 001.875.147c.642 0 1.27-.05 1.875-.147v-8.385H16.5z"
      />
    </svg>
  );
}

export function Footer() {
  const { t } = useI18n();
  const pathname = usePathname();
  if (isAppPanelPath(pathname)) {
    return null;
  }
  return (
    <footer className="mt-4 border-t border-gc-line text-gc-black lg:mt-8">
      <div className="gc-container grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <BrandLogo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-gc-mute">Focused learning without the noise.</p>
          <p className="mt-3 font-display text-lg text-gc-black">Learning, without the noise.</p>
          <div className="mt-5 flex gap-2.5" aria-label="Social links">
            {[
              { href: '/contact', label: 'Instagram', title: 'Gyan Chowk on Instagram', Icon: InstagramIcon },
              { href: '/contact', label: 'YouTube', title: 'Gyan Chowk on YouTube', Icon: YouTubeIcon },
              { href: '/contact', label: 'LinkedIn', title: 'Gyan Chowk on LinkedIn', Icon: LinkedInIcon },
              { href: '/contact', label: 'Facebook', title: 'Gyan Chowk on Facebook', Icon: FacebookIcon },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                aria-label={s.title}
                title={s.title}
                className="grid h-11 w-11 place-items-center rounded-full border border-gc-line bg-white hover:border-slate-300 shadow-2xs hover:shadow-md hover:scale-105 transition-all duration-200"
              >
                <s.Icon className="h-5 w-5 shrink-0" />
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-8">
          {cols.map((col) => (
            <div key={col.title}>
              <p className="mb-3 text-sm text-gc-mute">{col.title}</p>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link className="transition-colors hover:text-gc-mute" href={l.href}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="border-t border-gc-line py-5 text-center text-xs text-gc-mute">{t.footer.copy}</p>
    </footer>
  );
}
