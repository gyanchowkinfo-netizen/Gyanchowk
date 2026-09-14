import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { PageContainer, PageHeader, Breadcrumbs } from '@/components/layout/Page';

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = 120;

const LEGAL: Record<string, { title: string; body: string }> = {
  'privacy-policy': {
    title: 'Privacy policy',
    body: 'Gyan Chowk stores account, enrollment, progress and payment metadata required to run the platform. We do not sell personal data. Video watch progress is stored to resume playback. Recently viewed courses on this device stay in local storage. Contact admin@gyanchowk.com for data requests.',
  },
  'terms-and-conditions': {
    title: 'Terms and conditions',
    body: 'Gyan Chowk provides recorded educational content, tests, doubts and mentorship. Live classes are not offered. Paid access is granted only after payment verification. Teacher applications require admin approval. Do not share enrolled video URLs. Certificates can be verified at /verify/certificate/[id].',
  },
  'refund-policy': {
    title: 'Refund policy',
    body: 'Refunds are processed by Gyan Chowk administrators after review. Approved refunds credit the student wallet or Razorpay refund path. Course access may be revoked when a refund is captured. Contact support with your order ID.',
  },
  'cookie-policy': {
    title: 'Cookie policy',
    body: 'We use essential httpOnly cookies (gc_access, gc_refresh) for authentication. Language preference may be stored locally. We do not use advertising cookies. Ctrl+K search does not store queries on the server unless you submit a form.',
  },
  'payment-policy': {
    title: 'Payment policy',
    body: 'Prices are always calculated on the server from MongoDB. Razorpay checkout is used for paid items. Enrollment is created only after HMAC/webhook verification. Coupons and wallet debits are applied server-side. Never trust a frontend success event.',
  },
};

export function generateStaticParams() {
  return Object.keys(LEGAL).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const fallback = LEGAL[slug];
  return {
    title: fallback?.title ?? 'Legal',
    robots: { index: true },
    alternates: { canonical: `/${slug}` },
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fallback = LEGAL[slug];
  if (!fallback) notFound();
  let title = fallback.title;
  let body = fallback.body;
  try {
    const data = await api<{ page: { title?: string; body?: string } }>(`/api/cms/pages/${slug}`);
    if (data.page?.title) title = data.page.title;
    if (data.page?.body) body = data.page.body;
  } catch {
    /* static fallback */
  }
  return (
    <PageContainer>
      <Breadcrumbs items={[{ href: '/', label: 'Home' }, { label: title }]} />
      <PageHeader title={title} />
      <article className="max-w-3xl whitespace-pre-wrap text-gc-mist">{body}</article>
    </PageContainer>
  );
}
