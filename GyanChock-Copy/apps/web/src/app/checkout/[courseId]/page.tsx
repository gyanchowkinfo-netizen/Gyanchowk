'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { loadRazorpay } from '@/lib/hooks';
import { formatInr, salePrice } from '@/lib/format';
import { toast } from '@/lib/toast';
import { PageContainer, PageHeader } from '@/components/layout/Page';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/States';

function CheckoutInner() {
  const { courseId } = useParams<{ courseId: string }>();
  const type = (useSearchParams().get('type') as 'course' | 'batch') || 'course';
  const { user } = useAuth();
  const router = useRouter();
  const [coupon, setCoupon] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const course = useQuery({
    enabled: type === 'course',
    queryKey: ['checkout-course', courseId],
    queryFn: async () => {
      const data = await api<{ course: { _id: string; title: string; slug: string; price: number; discountPercent?: number; pricingType: string } }>(
        `/api/courses/by-id/${courseId}`,
      );
      return data.course;
    },
  });
  const batch = useQuery({
    enabled: type === 'batch',
    queryKey: ['checkout-batch', courseId],
    queryFn: async () => {
      const data = await api<{ batch: { _id: string; name: string; price: number; discountPercent?: number } }>(
        `/api/batches/by-id/${courseId}`,
      );
      return data.batch;
    },
  });

  const title = type === 'course' ? course.data?.title : batch.data?.name;
  const price = type === 'course' ? salePrice(course.data?.price ?? 0, course.data?.discountPercent, course.data?.pricingType) : salePrice(batch.data?.price ?? 0, batch.data?.discountPercent);

  async function pay(e: FormEvent) {
    e.preventDefault();
    if (!user) return router.push('/login');
    setBusy(true);
    setError('');
    try {
      if (price === 0) {
        await api('/api/payments/enroll-free', {
          method: 'POST',
          body: JSON.stringify({ productType: type, productId: courseId }),
        });
        router.push('/payment/success');
        return;
      }
      const order = await api<{
        razorpay: { orderId: string; amount: number; currency: string; keyId: string } | null;
        freeWithWallet?: boolean;
      }>('/api/payments/orders', {
        method: 'POST',
        body: JSON.stringify({ productType: type, productId: courseId, couponCode: coupon || undefined }),
      });
      if (order.freeWithWallet || !order.razorpay) {
        router.push('/payment/success');
        return;
      }
      if (!order.razorpay.keyId) {
        throw new Error('Razorpay is not configured on the server. Enrollment was not unlocked.');
      }
      await loadRazorpay();
      const rzp = new window.Razorpay!({
        key: order.razorpay.keyId,
        amount: order.razorpay.amount,
        currency: order.razorpay.currency,
        name: 'Gyan Chowk',
        order_id: order.razorpay.orderId,
        handler: async (response: Record<string, string>) => {
          try {
            await api('/api/payments/verify', { method: 'POST', body: JSON.stringify(response) });
            router.push('/payment/success');
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Verification failed');
            router.push('/payment/failed');
          }
        },
      });
      rzp.on('payment.failed', () => router.push('/payment/failed'));
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader title="Checkout" subtitle="Price comes from MongoDB. The UI never unlocks a paid course on its own." />
      <form onSubmit={pay} className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-2">
        <div className="gc-card space-y-3 p-5">
          <h2 className="text-gc-gold">Order</h2>
          <p>{title ?? 'Loading…'}</p>
          <p className="text-2xl text-gc-black">{price === 0 ? 'Free' : formatInr(price)}</p>
          <Input label="Coupon" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Optional code" />
          <p className="text-xs text-gc-mute">Cards/UPI via Razorpay. Wallet balance can offset payable amount on the server.</p>
        </div>
        <div className="gc-card space-y-3 p-5">
          <h2 className="text-gc-gold">Pay securely</h2>
          {error ? <Alert kind="error">{error}</Alert> : null}
          <Button className="w-full" loading={busy} type="submit">
            {price === 0 ? 'Enroll free' : 'Pay with Razorpay'}
          </Button>
          <p className="text-xs text-gc-mute">Success is confirmed only after signature/webhook verification.</p>
        </div>
      </form>
    </PageContainer>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CheckoutInner />
    </Suspense>
  );
}
