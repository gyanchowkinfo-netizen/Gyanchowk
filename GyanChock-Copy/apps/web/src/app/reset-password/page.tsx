'use client';

import { FormEvent, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AuthLayout, AuthError, AuthSuccess } from '@/components/auth/AuthLayout';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrength';

function Form() {
  const params = useSearchParams();
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await api('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: form.get('token'), password: form.get('password') }),
      });
      setMsg('Password updated. You can log in.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 gc-card p-6">
      <Input name="token" defaultValue={params.get('token') ?? ''} required label="Reset token" />
      <Input
        name="password"
        type="password"
        minLength={8}
        required
        label="New password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordStrengthIndicator password={password} />
      <AuthError>{error}</AuthError>
      <AuthSuccess>{msg}</AuthSuccess>
      <Button className="w-full" loading={loading} type="submit">
        Reset password
      </Button>
    </form>
  );
}

export default function ResetPage() {
  return (
    <AuthLayout title="Choose a new password">
      <Suspense>
        <Form />
      </Suspense>
    </AuthLayout>
  );
}
