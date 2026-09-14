'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthLayout, AuthError, AuthSuccess } from '@/components/auth/AuthLayout';

export default function ForgotPage() {
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const data = await api<{ resetToken?: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: form.get('email') }),
      });
      setMsg(
        data.resetToken
          ? `Development reset token (not emailed): ${data.resetToken}`
          : 'If that email exists, a reset link was prepared. Check your inbox.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Reset password" subtitle="We never confirm whether an email is registered.">
      <form onSubmit={onSubmit} className="space-y-4 gc-card p-6">
        <Input name="email" type="email" required label="Email" autoComplete="email" />
        <AuthError>{error}</AuthError>
        <AuthSuccess>{msg}</AuthSuccess>
        <Button className="w-full" loading={loading} type="submit">
          Send reset
        </Button>
      </form>
    </AuthLayout>
  );
}
