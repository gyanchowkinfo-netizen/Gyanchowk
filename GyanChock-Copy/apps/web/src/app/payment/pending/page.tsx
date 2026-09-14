import { PageContainer } from '@/components/layout/Page';

export default function PaymentPendingPage() {
  return (
    <PageContainer>
      <div className="gc-card mx-auto max-w-lg p-8 text-center">
        <h1 className="font-display text-3xl text-gc-black">Payment pending</h1>
        <p className="mt-3 text-sm text-gc-mute">
          If you completed Razorpay, wait for webhook confirmation. Do not assume success from the browser event alone.
        </p>
      </div>
    </PageContainer>
  );
}
