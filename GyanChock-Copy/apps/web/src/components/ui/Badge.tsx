import { cn } from '@/lib/format';

export function StatusBadge({ status }: { status: string }) {
  const tone =
    /active|published|answered|paid|present|open|approved|captured|success/i.test(status)
      ? 'border-emerald-500/40 text-emerald-300'
      : /pending|draft|scheduled|requested/i.test(status)
        ? 'border-gc-gold/40 text-gc-gold'
        : /fail|reject|suspend|closed|refund|absent/i.test(status)
          ? 'border-red-400/40 text-red-300'
          : 'border-gc-line text-gc-mist';
  return (
    <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs capitalize', tone)}>{status.replaceAll('_', ' ')}</span>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex rounded-full border border-gc-line px-2.5 py-0.5 text-xs text-gc-mist', className)}>
      {children}
    </span>
  );
}

export function Rating({ value = 0, count }: { value?: number; count?: number }) {
  const stars = Math.round(value);
  return (
    <span className="text-sm text-gc-gold" aria-label={`${value} out of 5`}>
      {'★'.repeat(stars)}
      <span className="text-gc-line">{'★'.repeat(Math.max(0, 5 - stars))}</span>
      {count != null ? <span className="ml-1 text-gc-mute">({count})</span> : null}
    </span>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gc-navy" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full bg-gradient-to-r from-gc-blue to-gc-gold" style={{ width: `${v}%` }} />
    </div>
  );
}

export function Avatar({ name, src, size = 40 }: { name?: string; src?: string; size?: number }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name ?? ''} width={size} height={size} className="rounded-full object-cover" />
    );
  }
  const initials = (name ?? 'G')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center rounded-full bg-gc-blue font-display text-xs text-white"
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  );
}

export function Alert({ kind = 'info', children }: { kind?: 'info' | 'error' | 'success'; children: React.ReactNode }) {
  const cls =
    kind === 'error'
      ? 'border-red-400/40 text-red-200'
      : kind === 'success'
        ? 'border-emerald-400/40 text-emerald-200'
        : 'border-gc-line text-gc-mist';
  return <div className={cn('rounded-xl border px-4 py-3 text-sm', cls)}>{children}</div>;
}
