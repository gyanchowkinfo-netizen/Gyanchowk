'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { PageContainer } from '@/components/layout/Page';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/ui/States';

function SuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');

  useEffect(() => {
    if (!sessionId) return;
    void api('/api/payments/verify-stripe-session', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }).catch(() => undefined);
  }, [sessionId]);

  return (
    <div className="gc-card mx-auto max-w-lg p-8 text-center">
      <p className="text-sm font-semibold text-gc-blue">Payment verified</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-gc-black">You are enrolled</h1>
      <p className="mt-3 text-sm text-gc-mute">
        Access unlocks only after Razorpay signature or Stripe webhook/session verification on the server.
      </p>
      <Link href="/student/courses" className="gc-btn-primary mt-6 inline-flex">
        Go to my courses
      </Link>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <PageContainer>
      <Suspense fallback={<LoadingState />}>
        <SuccessInner />
      </Suspense>
    </PageContainer>
  );
}
