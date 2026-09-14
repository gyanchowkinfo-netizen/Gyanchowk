import Link from 'next/link';
import { PageContainer } from '@/components/layout/Page';

export default function PaymentFailedPage() {
  return (
    <PageContainer>
      <div className="gc-card mx-auto max-w-lg p-8 text-center">
        <h1 className="font-display text-3xl text-red-300">Payment failed</h1>
        <p className="mt-3 text-sm text-gc-mute">Nothing was enrolled. You can retry checkout.</p>
        <Link href="/courses" className="gc-btn-gold mt-6 inline-flex">
          Back to courses
        </Link>
      </div>
    </PageContainer>
  );
}
