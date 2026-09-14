'use client';

import { cn } from '@/lib/format';
import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'gold' | 'blue' | 'ghost' | 'danger';

export function Button({
  variant = 'primary',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  const styles: Record<Variant, string> = {
    primary: 'gc-btn-primary',
    secondary: 'gc-btn-secondary',
    gold: 'gc-btn-secondary',
    blue: 'gc-btn-primary',
    ghost: 'gc-btn-ghost',
    danger: 'gc-btn border border-[color:var(--gyan-error)] text-[color:var(--gyan-error)] hover:bg-[color:color-mix(in_srgb,var(--gyan-error)_8%,transparent)]',
  };
  return (
    <button className={cn(styles[variant], className)} disabled={disabled || loading} {...props}>
      {loading ? 'Please wait…' : children}
    </button>
  );
}
