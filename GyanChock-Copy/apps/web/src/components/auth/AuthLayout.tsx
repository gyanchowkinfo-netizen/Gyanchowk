import { BrandLogo } from '@/components/brand/BrandLogo';
import type { ReactNode } from 'react';

export function AuthLayout({ title, children, subtitle }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 py-16">
      <BrandLogo />
      <h1 className="mt-6 text-center font-display text-3xl text-gc-black">{title}</h1>
      {subtitle ? <p className="mt-2 text-center text-sm text-gc-mute">{subtitle}</p> : null}
      <div className="mt-8 w-full">{children}</div>
    </main>
  );
}

export function AuthError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-xl border border-red-400/40 px-3 py-2 text-sm text-red-200">{children}</p>;
}

export function AuthSuccess({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-xl border border-emerald-400/40 px-3 py-2 text-sm text-emerald-200">{children}</p>;
}
