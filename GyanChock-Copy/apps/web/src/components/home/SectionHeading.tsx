import Link from 'next/link';
import { cn } from '@/lib/format';

export function SectionHeading({
  kicker,
  title,
  subtitle,
  href,
  action = 'View all →',
  align = 'left',
  id,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  href?: string;
  action?: string;
  align?: 'left' | 'center';
  id?: string;
}) {
  return (
    <div className={cn('mb-6 md:mb-8', align === 'center' ? 'mx-auto max-w-2xl text-center' : 'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between')}>
      <div className={cn('min-w-0', align === 'center' ? '' : 'max-w-2xl')}>
        {kicker ? (
          <p className="gc-kicker mb-3" id={id ? `${id}-kicker` : undefined}>
            {kicker}
          </p>
        ) : null}
        <h2 className="gc-section-title" id={id}>
          {title}
        </h2>
        {subtitle ? <p className="mt-3 text-[15px] leading-relaxed text-gc-mute sm:text-base">{subtitle}</p> : null}
      </div>
      {href && align === 'left' ? (
        <Link href={href} className="shrink-0 text-sm text-gc-mute transition-colors hover:text-gc-black">
          {action}
        </Link>
      ) : null}
    </div>
  );
}
