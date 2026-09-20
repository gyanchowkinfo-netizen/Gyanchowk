import { BrandLogo } from '@/components/brand/BrandLogo';
import type { ReactNode } from 'react';

export function AuthLayout({ title, children, subtitle }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 sm:py-16">
      <BrandLogo />
      <h1 className="mt-8 text-center font-display text-4xl font-normal tracking-tight text-gc-black sm:text-5xl">{title}</h1>
      {subtitle ? <p className="mt-2 text-center text-sm leading-relaxed text-gc-mute">{subtitle}</p> : null}
      <div className="mt-8 w-full">{children}</div>
    </main>
  );
}

export function AuthError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-[12px] border border-[color:var(--gyan-error)]/30 bg-[color:var(--gyan-error-soft)] px-3 py-2 text-sm text-[color:var(--gyan-error)]">{children}</p>;
}

export function AuthSuccess({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-[12px] border border-[color:var(--gyan-success)]/30 bg-[color:var(--gyan-success-soft)] px-3 py-2 text-sm text-[color:var(--gyan-success)]">{children}</p>;
}
