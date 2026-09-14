import { PageContainer, PageHeader, Breadcrumbs } from '@/components/layout/Page';
import { StaggerContainer, StaggerItem } from '@/components/motion';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help centre',
  description: 'Help using Gyan Chowk recorded learning, tests, payments and certificates.',
};

export default function HelpPage() {
  return (
    <PageContainer>
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: 'Help' }]} />
      <PageHeader title="Help centre" subtitle="Recorded learning support. We do not run live classes." />
      <StaggerContainer className="grid gap-4 md:grid-cols-2">
        {[
          ['Watching videos', 'Open Learning from the student panel. Playback is HLS with resume.'],
          ['Payments', 'Checkout uses Razorpay. Access unlocks after server verification.'],
          ['Tests', 'Answers autosave. Submit before the timer ends.'],
          ['Certificates', 'Issued near 90% completion. Verify at /verify/certificate/[id].'],
        ].map(([t, b]) => (
          <StaggerItem key={t}>
            <article className="gc-card p-5">
              <h2 className="text-gc-gold">{t}</h2>
              <p className="mt-2 text-sm text-gc-mist">{b}</p>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </PageContainer>
  );
}
