'use client';

import { FormEvent, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input, PasswordInput, Select, Textarea } from '@/components/ui/Input';
import { AuthLayout, AuthError, AuthSuccess } from '@/components/auth/AuthLayout';
import { PasswordStrengthIndicator } from '@/components/auth/PasswordStrength';

function RegisterForm() {
  const search = useSearchParams();
  const ref = search.get('ref') ?? '';
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState(search.get('role') === 'teacher' ? 'teacher' : 'student');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const pwd = String(form.get('password') || '');
    const confirmPwd = String(form.get('confirmPassword') || '');
    if (pwd !== confirmPwd) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      const data = await api<{ message: string; verifyToken?: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          password: form.get('password'),
          role: form.get('role'),
          referralCode: form.get('referralCode') || undefined,
          state: form.get('state') || undefined,
          phone: form.get('phone') || undefined,
          headline: form.get('headline') || undefined,
          bio: form.get('bio') || undefined,
        }),
      });
      if (data.verifyToken) {
        await api('/api/auth/verify-email', { method: 'POST', body: JSON.stringify({ token: data.verifyToken }) });
        setMessage(
          role === 'teacher'
            ? 'Teacher application created and email verified (dev). Log in — catalog access waits for admin approval. Upload documents from the teacher panel.'
            : 'Account created and verified (dev). You can log in.',
        );
      } else setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 gc-card p-6">
      <Input name="name" required label="Full name" autoComplete="name" />
      <Input name="email" type="email" required label="Email" autoComplete="email" />
      <PasswordInput
        name="password"
        required
        minLength={8}
        label="Password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <PasswordStrengthIndicator password={password} />
      <PasswordInput
        name="confirmPassword"
        required
        minLength={8}
        label="Confirm password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={confirm && confirm !== password ? 'Passwords do not match' : undefined}
      />
      <Select name="role" label="I am a" value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="student">Student</option>
        <option value="teacher">Teacher applicant</option>
      </Select>
      <Input name="phone" label="Phone (optional)" />
      <Input name="state" label="State (for rank)" />
      {role === 'teacher' ? (
        <>
          <Input name="headline" label="Headline" placeholder="Physics faculty · JEE" />
          <Textarea name="bio" label="Short bio" placeholder="Experience, exams you teach" />
          <p className="text-xs text-gc-mute">
            After login, upload ID and qualification documents from the teacher dashboard. Files go through Cloudinary only when credentials are configured.
          </p>
        </>
      ) : (
        <Input name="referralCode" label="Referral code (optional)" defaultValue={ref} />
      )}
      <AuthError>{error}</AuthError>
      <AuthSuccess>{message}</AuthSuccess>
      <Button className="w-full" loading={loading} type="submit">
        Register
      </Button>
      <p className="text-center text-sm text-gc-mute">
        Already have an account? <Link href="/login" className="text-gc-gold">Sign in</Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <AuthLayout title="Create your account" subtitle="Teacher applications require admin approval. Admin registration is never public.">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
