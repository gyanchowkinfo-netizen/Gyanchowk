'use client';

import { FormEvent, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { AuthLayout, AuthError } from '@/components/auth/AuthLayout';

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get('next');
  const setUser = useAuth((s) => s.setUser);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const data = await api<{ user: { role: 'student' | 'teacher' | 'admin'; name: string; email: string; id: string; status: string } }>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({
            email: String(form.get('email') || '').trim(),
            password: String(form.get('password') || '').trim(),
          }),
        },
      );
      setUser(data.user);
      if (next) router.push(next);
      else router.push(data.user.role === 'admin' ? '/admin' : data.user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 gc-card p-6">
      <Input name="email" type="email" required label="Email" autoComplete="email" />
      <PasswordInput name="password" required label="Password" autoComplete="current-password" />
      <AuthError>{error}</AuthError>
      <Button className="w-full" loading={loading} type="submit">
        Sign in
      </Button>
      <p className="text-center text-sm text-gc-mute">
        <Link href="/forgot-password" className="text-gc-glow">
          Forgot password
        </Link>
        {' · '}
        <Link href="/register" className="text-gc-gold">
          Create account
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Admin accounts are never created from this page.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
