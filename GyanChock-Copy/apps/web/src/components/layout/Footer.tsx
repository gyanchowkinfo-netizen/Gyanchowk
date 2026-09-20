'use client';

import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';
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
      { href: '/#ai-copilot', label: 'AI Learning' },
      { href: '/student/certificates', label: 'Certificates' },
    ],
  },
  {
    title: 'Exams',
    links: [
      { href: '/courses?category=JEE', label: 'JEE' },
      { href: '/courses?category=NEET', label: 'NEET' },
      { href: '/courses?category=Boards', label: 'Boards' },
      { href: '/courses?category=Government%20exams', label: 'Government Exams' },
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
      { href: '/career', label: 'Careers' },
      { href: '/terms-and-conditions', label: 'Terms' },
      { href: '/privacy-policy', label: 'Privacy' },
      { href: '/refund-policy', label: 'Refund Policy' },
    ],
  },
];

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
          <div className="mt-5 flex gap-2" aria-label="Social">
            {[
              { href: '/contact', label: 'Instagram', Icon: Instagram },
              { href: '/contact', label: 'YouTube', Icon: Youtube },
              { href: '/contact', label: 'LinkedIn', Icon: Linkedin },
              { href: '/contact', label: 'Facebook', Icon: Facebook },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="grid h-11 w-11 place-items-center rounded-full border border-gc-line text-gc-mist hover:text-gc-black"
              >
                <s.Icon size={16} />
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 md:col-span-8">
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
