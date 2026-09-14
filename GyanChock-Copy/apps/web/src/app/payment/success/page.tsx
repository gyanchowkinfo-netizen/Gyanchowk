import Link from 'next/link';
import { PageContainer } from '@/components/layout/Page';

export default function PaymentSuccessPage() {
  return (
    <PageContainer>
      <div className="gc-card mx-auto max-w-lg p-8 text-center">
        <p className="text-gc-gold">Payment verified</p>
        <h1 className="mt-2 font-display text-3xl">You are enrolled</h1>
        <p className="mt-3 text-sm text-gc-mute">Access was unlocked only after the backend confirmed Razorpay.</p>
        <Link href="/student/courses" className="gc-btn-gold mt-6 inline-flex">
          Go to my courses
        </Link>
      </div>
    </PageContainer>
  );
}
