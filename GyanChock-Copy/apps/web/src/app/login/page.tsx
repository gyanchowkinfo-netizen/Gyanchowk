'use client';

import { FormEvent, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput } from '@/components/ui/Input';
import { AuthError } from '@/components/auth/AuthLayout';

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get('next');
  const setUser = useAuth((s) => s.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api<{
        user: { role: 'student' | 'teacher' | 'admin'; name: string; email: string; id: string; status: string };
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      setUser(data.user);
      if (next) router.push(next);
      else router.push(data.user.role === 'admin' ? '/admin' : data.user.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 antialiased selection:bg-amber-100 selection:text-amber-900">
      <main className="w-full max-w-xl mx-auto space-y-6">
        {/* Form Title & Subtitle */}
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-stone-900">
            Welcome To Gyan Chowk
          </h1>
          <p className="mt-1.5 text-sm text-stone-600">
            Sign in to access your courses, mock test analysis, and workspace.
          </p>
        </div>

        {error ? <AuthError>{error}</AuthError> : null}

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-sm">
          <div className="space-y-1.5">
            <Input
              label="Email address"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <PasswordInput
              label="Password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-stone-500">Secure AES-256 session</span>
            <Link
              href="/forgot-password"
              className="font-medium text-stone-700 hover:text-stone-900 underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full !rounded-xl !py-3 !text-sm !font-semibold shadow-md mt-2"
          >
            Sign In to Portal
          </Button>

          <div className="pt-3 text-center">
            <Link
              href="/register"
              className="text-xs text-stone-600 hover:text-stone-900 font-medium"
            >
              Need a student or teacher account? <span className="font-semibold text-amber-800 underline">Register here</span>
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-800 border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
