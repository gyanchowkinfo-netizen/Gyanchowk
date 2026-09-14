'use client';

import { cn } from '@/lib/format';
import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

export function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  const fid = id || props.name;
  return (
    <label className="block space-y-1.5 text-sm" htmlFor={fid}>
      {label ? <span className="text-gc-mist">{label}</span> : null}
      <input id={fid} className={cn('gc-input', error && 'border-red-400', className)} {...props} />
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </label>
  );
}

export function PasswordInput({
  label,
  error,
  className,
  id,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label?: string; error?: string }) {
  const [visible, setVisible] = useState(false);
  const fid = id || props.name;
  return (
    <label className="block space-y-1.5 text-sm" htmlFor={fid}>
      {label ? <span className="text-gc-mist">{label}</span> : null}
      <span className="relative block">
        <input
          id={fid}
          type={visible ? 'text' : 'password'}
          className={cn('gc-input pr-12', error && 'border-red-400', className)}
          {...props}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 grid w-12 place-items-center text-gc-mute hover:text-gc-gold"
          aria-label={visible ? 'Hide password' : 'Show password'}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </label>
  );
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  const fid = id || props.name;
  return (
    <label className="block space-y-1.5 text-sm" htmlFor={fid}>
      {label ? <span className="text-gc-mist">{label}</span> : null}
      <textarea id={fid} className={cn('gc-input min-h-28', className)} {...props} />
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </label>
  );
}

export function Select({
  label,
  error,
  children,
  className,
  id,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string }) {
  const fid = id || props.name;
  return (
    <label className="block space-y-1.5 text-sm" htmlFor={fid}>
      {label ? <span className="text-gc-mist">{label}</span> : null}
      <select id={fid} className={cn('gc-input', className)} {...props}>
        {children}
      </select>
      {error ? <span className="text-xs text-red-400">{error}</span> : null}
    </label>
  );
}
