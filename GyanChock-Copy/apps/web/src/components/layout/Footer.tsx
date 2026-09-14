'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { useI18n } from '@/i18n/provider';
import { isAppPanelPath } from '@/lib/paths';

export function Footer() {
  const { t } = useI18n();
  const pathname = usePathname();
  if (isAppPanelPath(pathname)) {
    return null;
  }
  return (
    <footer className="mt-16 bg-[color:var(--gyan-footer)] pb-20 text-[color:var(--gyan-footer-text)] lg:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <BrandLogo />
          <p className="mt-3 max-w-sm text-sm text-[color:var(--gyan-footer-muted)]">{t.tagline} Recorded learning, batches, tests and mentorship — no live classes.</p>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm tracking-widest text-gc-gold">LEARN</h3>
          <ul className="space-y-2 text-sm text-[color:var(--gyan-footer-text)]">
            <li><Link href="/courses">Courses</Link></li>
            <li><Link href="/batches">Batches</Link></li>
            <li><Link href="/teachers">Teachers</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm tracking-widest text-gc-gold">GROW</h3>
          <ul className="space-y-2 text-sm text-[color:var(--gyan-footer-text)]">
            <li><Link href="/career">Career</Link></li>
            <li><Link href="/career/roadmaps">Roadmaps</Link></li>
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/help">Help</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-display text-sm tracking-widest text-gc-gold">TRUST</h3>
          <ul className="space-y-2 text-sm text-[color:var(--gyan-footer-text)]">
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/privacy-policy">Privacy</Link></li>
            <li><Link href="/terms-and-conditions">Terms</Link></li>
            <li><Link href="/refund-policy">Refunds</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-[color:var(--gyan-footer-muted)]">{t.footer.copy}</p>
    </footer>
  );
}
