'use client';

import { FormEvent, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthLayout, AuthError, AuthSuccess } from '@/components/auth/AuthLayout';

function VerifyInner() {
  const params = useSearchParams();
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await api('/api/auth/verify-email', { method: 'POST', body: JSON.stringify({ token: form.get('token') }) });
      setMsg('Email verified. You can log in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid token');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 gc-card p-6">
      <Input name="token" defaultValue={params.get('token') ?? ''} required label="Verification token" />
      <AuthError>{error}</AuthError>
      <AuthSuccess>{msg}</AuthSuccess>
      <Button className="w-full" loading={loading} type="submit">
        Verify email
      </Button>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout title="Verify your email">
      <Suspense>
        <VerifyInner />
      </Suspense>
    </AuthLayout>
  );
}
